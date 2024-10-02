// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import Script from "next/script";
import { Loadingbutton } from "./ui/loadingbutton";
import { Mail as MailIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { MailType } from "@/lib/validation/mail";
import axios from "axios";
export const SyncMailButton = () => {
  const { userId } = useAuth();
  const router = useRouter();
  const [gapiReady, setGapiReady] = useState(false);
  const [gisReady, setGisReady] = useState(false);
  const [messages, setMessages] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokenClient, setTokenClient] = useState(null);

  const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
  const DISCOVERY_DOC =
    "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest";
  const SCOPES = "https://www.googleapis.com/auth/gmail.readonly";

  // let tokenClient;

  useEffect(() => {
    if (typeof window !== "undefined" && gapiReady && gisReady) {
      initializeGapiClient();
    }
  }, [gapiReady, gisReady]);

  async function initializeGapiClient() {
    await window.gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });
    initializeGisClient();
  }

  function initializeGisClient() {
    const newTokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: "", // defined later
    });
    setTokenClient(newTokenClient);
  }

  function handleAuthClick() {
    if (!tokenClient) {
      console.error("Token client not initialized");
      return;
    }

    tokenClient.callback = async (resp) => {
      if (resp.error !== undefined) {
        throw resp;
      }
      await listMessages().then(() => {
        console.log("done homie");
        handleSignoutClick();
        console.log("done homie");
        router.refresh();
      });
    };

    if (window.gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: "consent" });
    } else {
      tokenClient.requestAccessToken({ prompt: "" });
    }
  }

  function handleSignoutClick() {
    const token = window.gapi.client.getToken();
    if (token !== null) {
      window.google.accounts.oauth2.revoke(token.access_token);
      window.gapi.client.setToken("");
      setMessages("");
    }
  }

  async function listMessages() {
    setIsLoading(true);
    setMessages("");
    let response;
    try {
      response = await window.gapi.client.gmail.users.messages.list({
        userId: "me",
        maxResults: 3,
        q: "in:inbox category:primary",
      });
    } catch (err) {
      setMessages(err.message);
      setIsLoading(false);
      return;
    }
    const messages = response.result.messages;
    if (!messages || messages.length == 0) {
      setMessages("No messages found.");
      setIsLoading(false);
      return;
    }

    let messageDetails = "";
    let mailsToCreate: MailType[] = [];
    for (const message of messages) {
      const msgResponse = await window.gapi.client.gmail.users.messages.get({
        userId: "me",
        id: message.id,
      });
      const msg = msgResponse.result;
      const headers = msg.payload.headers;
      const subject = headers.find((header) => header.name === "Subject").value;
      const from = headers.find((header) => header.name === "From").value;
      const date = headers.find((header) => header.name === "Date").value;
      let getData = msg.payload;
      let body = getData.body.data;
      while (body == undefined) {
        getData = getData.parts[0];
        body = getData.body.data;
      }
      body = Buffer.from(body, "base64").toString("utf-8");
      messageDetails += `From: ${from}\nSubject: ${subject}\nDate: ${date}\nBody: ${body}\n\n`;
      mailsToCreate.push({
        subject: subject,
        body: body,
        from: from,
        userId: String(userId),
        ReceivedAt: date,
        Category: [],
      });
    }
    const insertedMails = await axios.post("/api/mails", {
      mails: mailsToCreate,
    });
    console.log(insertedMails.status);
    setMessages(messageDetails);
    setIsLoading(false);
  }
  function removeHTMLTags(str: string) {
    return str.replace(/<[^>]*>/g, "");
  }

  return (
    <>
      <Script
        src="https://apis.google.com/js/api.js"
        onLoad={() => {
          window.gapi.load("client", () => setGapiReady(true));
        }}
      />
      <Script
        src="https://accounts.google.com/gsi/client"
        onLoad={() => setGisReady(true)}
      />
      <main>
        {gapiReady && gisReady ? (
          <>
            <Loadingbutton
              loading={isLoading}
              disabled={isLoading}
              onClick={handleAuthClick}
              type="button"
            >
              <MailIcon className="mr-2" />
              {isLoading ? "Syncing..." : "Sync with Gmail"}
            </Loadingbutton>
          </>
        ) : (
          <p>Loading API client...</p>
        )}
        {!isLoading && <pre style={{ whiteSpace: "pre-wrap" }}>{messages}</pre>}
      </main>
    </>
  );
};
