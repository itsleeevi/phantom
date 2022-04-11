import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import * as web3 from "@solana/web3.js";
import React, { useEffect, useState } from "react";
import base58 from "bs58";
/*
// Set our network to devent.
const network = clusterApiUrl("devnet");
*/

export default function Home() {
  const [connected, setConnected] = useState(false);
  const [provider, setProvider] = useState(window.solana);
  const [connection, setConnection] = useState(undefined);
  const [walletAddress, setWalletAddress] = useState(undefined);
  const recieverWallet = "C3EteStFtwBxZC7NjmFXWt2EaZTgWrxkn3eWDLeALzW3";

  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      setWalletAddress(response.publicKey.toString());
      setConnected(true);
    }
  };

  const getProvider = async () => {
    if ("solana" in window) {
      const provider = window.solana;
      if (provider.isPhantom) {
        console.log("Is Phantom installed?  ", provider.isPhantom);
        return provider;
      }
    } else {
      window.open("https://www.phantom.app/", "_blank");
    }
  };

  useEffect(() => {
    const init = async () => {
      const provider = await getProvider();
      const connection = new web3.Connection(web3.clusterApiUrl("devnet"));

      setProvider(provider);
      setConnection(connection);
    };
    init();
  }, []);

  async function sendTransaction() {
    // I have hardcoded my secondary wallet address here. You can take this address either from user input or your DB or wherever
    var recieverWallet = new web3.PublicKey(
      "9fuYBoRvgptU4fVZ8ZqvWTTc6oC68P4tjuSA2ySzn6Nv"
    );

    var transaction = new web3.Transaction().add(
      web3.SystemProgram.transfer({
        fromPubkey: walletAddress,
        toPubkey: recieverWallet,
        lamports: 10000, //Investing 1 SOL. Remember 1 Lamport = 10^-9 SOL.
      })
    );

    transaction.feePayer = await window.solana.publicKey;
    let { blockhash } = await connection.getRecentBlockhash();
    transaction.recentBlockhash = blockhash;

    const signed = await provider.request({
      method: "signTransaction",
      params: {
        message: base58.encode(transaction.serializeMessage()),
      },
    });
    const signature = base58.decode(signed.signature);
    transaction.addSignature(initializerKey, signature);
    transaction.partialSign(...[tempTokenAccount]);

    await connection.sendRawTransaction(transaction.serialize());
  }

  return (
    <div className="flex justify-center items-center h-screen">
      {connected ? (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={(e) => {
            e.preventDefault();
            sendTransaction();
          }}
        >
          Transfer
        </button>
      ) : (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={(e) => {
            e.preventDefault();
            connectWallet();
          }}
        >
          Connect
        </button>
      )}
    </div>
  );
}
