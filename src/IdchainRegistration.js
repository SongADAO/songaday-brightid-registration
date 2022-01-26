import googlePlay from "./google-play.png";
import appStore from "./app-store.png";
import "./IdchainRegistration.css";
import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode.react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

function IdchainRegistration(props) {
    const firstUpdate = useRef(true);

    const contractAbi = [
        {
            type: "constructor",
            stateMutability: "nonpayable",
            inputs: [
                {
                    type: "address",
                    name: "_verifierToken",
                    internalType: "contract IERC20",
                },
                { type: "bytes32", name: "_app", internalType: "bytes32" },
            ],
        },
        {
            type: "event",
            name: "OwnershipTransferred",
            inputs: [
                {
                    type: "address",
                    name: "previousOwner",
                    internalType: "address",
                    indexed: true,
                },
                {
                    type: "address",
                    name: "newOwner",
                    internalType: "address",
                    indexed: true,
                },
            ],
            anonymous: false,
        },
        {
            type: "event",
            name: "Sponsor",
            inputs: [
                {
                    type: "address",
                    name: "addr",
                    internalType: "address",
                    indexed: true,
                },
            ],
            anonymous: false,
        },
        {
            type: "event",
            name: "Verified",
            inputs: [
                {
                    type: "address",
                    name: "addr",
                    internalType: "address",
                    indexed: true,
                },
            ],
            anonymous: false,
        },
        {
            type: "event",
            name: "VerifierTokenSet",
            inputs: [
                {
                    type: "address",
                    name: "verifierToken",
                    internalType: "contract IERC20",
                    indexed: false,
                },
            ],
            anonymous: false,
        },
        {
            type: "function",
            stateMutability: "view",
            outputs: [{ type: "uint32", name: "", internalType: "uint32" }],
            name: "REGISTRATION_PERIOD",
            inputs: [],
        },
        {
            type: "function",
            stateMutability: "view",
            outputs: [{ type: "bytes32", name: "", internalType: "bytes32" }],
            name: "app",
            inputs: [],
        },
        {
            type: "function",
            stateMutability: "view",
            outputs: [{ type: "address", name: "", internalType: "address" }],
            name: "history",
            inputs: [{ type: "address", name: "", internalType: "address" }],
        },
        {
            type: "function",
            stateMutability: "view",
            outputs: [{ type: "bool", name: "", internalType: "bool" }],
            name: "isVerifiedUser",
            inputs: [
                { type: "address", name: "_user", internalType: "address" },
            ],
        },
        {
            type: "function",
            stateMutability: "view",
            outputs: [{ type: "address", name: "", internalType: "address" }],
            name: "owner",
            inputs: [],
        },
        {
            type: "function",
            stateMutability: "nonpayable",
            outputs: [],
            name: "renounceOwnership",
            inputs: [],
        },
        {
            type: "function",
            stateMutability: "nonpayable",
            outputs: [],
            name: "setVerifierToken",
            inputs: [
                {
                    type: "address",
                    name: "_verifierToken",
                    internalType: "contract IERC20",
                },
            ],
        },
        {
            type: "function",
            stateMutability: "nonpayable",
            outputs: [],
            name: "sponsor",
            inputs: [
                { type: "address", name: "addr", internalType: "address" },
            ],
        },
        {
            type: "function",
            stateMutability: "nonpayable",
            outputs: [],
            name: "transferOwnership",
            inputs: [
                { type: "address", name: "newOwner", internalType: "address" },
            ],
        },
        {
            type: "function",
            stateMutability: "view",
            outputs: [
                { type: "uint256", name: "time", internalType: "uint256" },
                { type: "bool", name: "isVerified", internalType: "bool" },
            ],
            name: "verifications",
            inputs: [{ type: "address", name: "", internalType: "address" }],
        },
        {
            type: "function",
            stateMutability: "view",
            outputs: [
                { type: "address", name: "", internalType: "contract IERC20" },
            ],
            name: "verifierToken",
            inputs: [],
        },
        {
            type: "function",
            stateMutability: "nonpayable",
            outputs: [],
            name: "verify",
            inputs: [
                { type: "address[]", name: "addrs", internalType: "address[]" },
                { type: "uint256", name: "timestamp", internalType: "uint256" },
                { type: "uint8", name: "v", internalType: "uint8" },
                { type: "bytes32", name: "r", internalType: "bytes32" },
                { type: "bytes32", name: "s", internalType: "bytes32" },
            ],
        },
    ];

    const [isConnected, setIsConnected] = useState(false);

    const [walletAddress, setWalletAddress] = useState("");

    const [ens, setENS] = useState("");

    const [qrCodeUrlIdchain, setQrCodeUrlIdchain] = useState("");

    const [qrCodeUrl, setQrCodeUrl] = useState("");

    const [chainId, setChainId] = useState("");

    const [gasBalance, setGasBalance] = useState(0.0);

    const [brightIDVerification, setBrightIDVerification] = useState({
        isBrightIDIdchainLinked: false,
        isBrightIDLinked: false,
        isSponsoredViaContract: false,
    });

    const [isVerifiedViaContract, setIsVerifiedViaContract] = useState(null);

    const [
        isSponsoredViaContractTxnProcessing,
        setIsSponsoredViaContractTxnProcessing,
    ] = useState(false);

    const [
        isVerifiedViaContractTxnProcessing,
        setIsVerifiedViaContractTxnProcessing,
    ] = useState(false);

    const [isSponsoredViaContractTxnId, setIsSponsoredViaContractTxnId] =
        useState(null);

    const [isVerifiedViaContractTxnId, setIsVerifiedViaContractTxnId] =
        useState(null);

    const [stepConnecWalletStateError, setStepConnecWalletStateError] =
        useState("");

    const [
        stepSwitchToIDChainNetworkError,
        setStepSwitchToIDChainNetworkError,
    ] = useState("");

    const [stepObtainGasTokensError, setStepObtainGasTokensError] =
        useState("");

    const [stepSponsoredViaContractError, setStepSponsoredViaContractError] =
        useState("");

    const [stepVerifyViaContractError, setStepVerifyViaContractError] =
        useState("");

    function hasInstalledWallet() {
        return true;
    }

    function hasConnectedWallet() {
        return walletAddress !== "";
    }

    function hasBrightIDIdchainLinked() {
        return brightIDVerification.isBrightIDIdchainLinked === true;
    }

    function hasBrightIDLinked() {
        return brightIDVerification.isBrightIDLinked === true;
    }

    function hasSponsoredViaContract() {
        return brightIDVerification.isSponsoredViaContract === true;
    }

    function hasVerifiedViaContract() {
        return isVerifiedViaContract === true;
    }

    function hasSwitchedToIDChainNetwork() {
        return chainId === Number(props.registrationChainId);
    }

    function hasObtainedGasTokens() {
        return gasBalance !== 0 && gasBalance !== 0.0 && gasBalance !== "0.0";
    }

    function timeout(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function getWeb3Modal() {
        const providerOptions = {
            walletconnect: {
                package: WalletConnectProvider,
                options: {
                    infuraId: props.walletConnectInfuraId, // required
                    rpc: {},
                    // network: props.registrationChainName,
                },
            },
        };

        providerOptions.walletconnect.options.rpc[props.registrationChainId] =
            props.registrationRpcUrl;

        return new Web3Modal({
            network: "mainnet", // optional
            cacheProvider: true, // optional
            providerOptions, // required
        });
    }

    async function getInstance() {
        const web3Modal = await getWeb3Modal();

        return await web3Modal.connect();
    }

    async function getFreshInstance() {
        if (getProviderType() === "walletconnect") {
            localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");
            localStorage.removeItem("walletconnect");
        }

        const web3Modal = await getWeb3Modal();

        await web3Modal.clearCachedProvider();

        return await web3Modal.connect();
    }

    async function getProvider() {
        const instance = await getInstance();

        return new ethers.providers.Web3Provider(instance);
    }

    function getProviderType() {
        return JSON.parse(localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER"));
    }

    function canAutoSwitchNetworks() {
        return getProviderType() !== "walletconnect";
    }

    function getMainnetProvider() {
        return new ethers.providers.JsonRpcProvider(props.mainnetRpcUrl);
    }

    function getIdchainProvider() {
        return new ethers.providers.JsonRpcProvider(props.registrationRpcUrl);
    }

    async function getIdchainProviderContract() {
        const provider = await getIdchainProvider();

        return new ethers.Contract(props.contractAddr, contractAbi, provider);
    }

    // async function getContract() {
    //     const provider = await getProvider();

    //     return new ethers.Contract(props.contractAddr, contractAbi, provider);
    // }

    async function getContractRw() {
        const provider = await getProvider();

        return new ethers.Contract(
            props.contractAddr,
            contractAbi,
            provider.getSigner()
        );
    }

    function updateWalletAddress(addr) {
        updateENS(addr);
        setWalletAddress(addr);
        setQrCodeUrlIdchain(`${props.deepLinkPrefix}/idchain/${addr}`);
        setQrCodeUrl(`${props.deepLinkPrefix}/${props.context}/${addr}`);
    }

    async function updateENS(addr) {
        var ens = await queryENS();

        setENS(ens);
    }

    // function installWallet() {
    //     window.open("https://metamask.io/", "_blank");
    // }

    function verifyWithBrightID() {
        window.open(props.brightIdMeetUrl, "_blank");
    }

    function linkAddressToBrightIDIdchain() {
        window.open(qrCodeUrlIdchain);
    }

    function linkAddressToBrightID() {
        window.open(qrCodeUrl);
    }

    async function connectWallet() {
        try {
            await getInstance();

            setIsConnected(true);
            setStepConnecWalletStateError("");
        } catch (e) {
            // console.error(e);
            // console.log(e);

            setIsConnected(false);
            setStepConnecWalletStateError(e.message);
        }
    }

    async function chooseWallet() {
        try {
            await getFreshInstance();

            setIsConnected(true);
            setStepConnecWalletStateError("");
        } catch (e) {
            // console.error(e);
            // console.log(e);

            setIsConnected(false);
            setStepConnecWalletStateError(e.message);
        }
    }

    async function queryWalletAddress() {
        const provider = await getProvider();

        const accounts = await provider.listAccounts();

        if (accounts.length === 0) {
            throw new Error("No Wallet Address Found");
        }

        return accounts[0];
    }

    async function queryENS() {
        try {
            const addr = await queryWalletAddress();

            const provider = getMainnetProvider();

            const name = await provider.lookupAddress(addr);

            // console.log(name);

            return name;
        } catch (e) {
            // console.error(e);
            // console.log(e);
        }
    }

    async function initWalletAddress() {
        try {
            const addr = await queryWalletAddress();

            // console.log(addr);

            updateWalletAddress(addr);
        } catch (e) {
            // console.error(e);
            // console.log(e);
        }
    }

    async function initChainId() {
        try {
            const provider = await getProvider();

            const { chainId } = await provider.getNetwork();

            // console.log(chainId);

            setChainId(chainId);
        } catch (e) {
            // console.error(e);
            // console.log(e);
        }
    }

    async function initGasBalance() {
        try {
            const addr = await queryWalletAddress();

            const provider = await getIdchainProvider();

            const balanceRaw = await provider.getBalance(addr);

            const balance = ethers.utils.formatEther(balanceRaw);

            // console.log(balance);

            setGasBalance(balance);
        } catch (e) {
            // console.error(e);
            // console.log(e);

            setGasBalance(0);
        }
    }

    async function initIsBrightIDVerifications() {
        const verifications = {
            isBrightIDIdchainLinked: hasBrightIDIdchainLinked(),
            isBrightIDLinked: hasBrightIDLinked(),
            isSponsoredViaContract: hasSponsoredViaContract(),
        };

        try {
            const addr = await queryWalletAddress();

            if (verifications.isBrightIDIdchainLinked === false) {
                verifications.isBrightIDIdchainLinked =
                    await checkBrightIDIdchainLink(addr);

                await timeout(1000);
            }

            if (verifications.isBrightIDLinked === false) {
                verifications.isBrightIDLinked = await checkBrightIDLink(addr);
            }

            if (
                verifications.isBrightIDLinked === true &&
                verifications.isSponsoredViaContract === false
            ) {
                await timeout(1000);

                verifications.isSponsoredViaContract =
                    await checkBrightIDSponsorship(addr);
            }

            setBrightIDVerification(verifications);
        } catch (e) {
            // console.error(e);
            // console.log(e);

            setBrightIDVerification(verifications);
        }
    }

    async function initIsVerifiedViaContract() {
        try {
            const addr = await queryWalletAddress();

            const isVerifiedViaContract = await checkBrightIDVerification(addr);

            // console.log(isVerifiedViaContract);

            setIsVerifiedViaContract(isVerifiedViaContract);
        } catch (e) {
            // console.error(e);
            // console.log(e);

            setIsVerifiedViaContract(false);
        }
    }

    async function switchToIDChainNetwork() {
        const registrationHexChainId = ethers.utils.hexlify(
            Number(props.registrationChainId)
        );

        try {
            const provider = await getProvider();

            await provider.provider.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: registrationHexChainId }],
            });

            setStepSwitchToIDChainNetworkError("");
        } catch (switchError) {
            // console.log(switchError);

            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                try {
                    const provider = await getProvider();

                    await provider.provider.request({
                        method: "wallet_addEthereumChain",
                        params: [
                            {
                                chainId: registrationHexChainId,
                                chainName: props.registrationChainName,
                                nativeCurrency: {
                                    name: props.registrationTokenName,
                                    symbol: props.registrationTokenName,
                                    decimals: Number(
                                        props.registrationTokenDecimal
                                    ),
                                },
                                rpcUrls: [props.registrationRpcUrl],
                                blockExplorerUrls: [
                                    props.registrationBlockExplorerUrl,
                                ],
                                iconUrls: [props.registrationIconUrl],
                            },
                        ],
                    });

                    setStepSwitchToIDChainNetworkError("");
                } catch (addError) {
                    // console.error(addError);
                    // console.log(addError);

                    setStepSwitchToIDChainNetworkError(addError.message);
                }

                return;
            }

            // console.error(switchError);
            // console.log(switchError);

            setStepSwitchToIDChainNetworkError(switchError.message);
        }
    }

    async function sponsorViaContract() {
        try {
            const addr = await queryWalletAddress();

            const contract = await getContractRw();

            const tx = await contract.sponsor(addr);

            setIsSponsoredViaContractTxnProcessing(true);
            setIsSponsoredViaContractTxnId(tx.hash);
            setStepSponsoredViaContractError("");

            // wait for the transaction to be mined
            await tx.wait();
            // const receipt = await tx.wait();
            // // console.log(receipt);

            await initIsBrightIDVerifications();

            setIsSponsoredViaContractTxnProcessing(false);
            setIsSponsoredViaContractTxnId(null);
            setStepSponsoredViaContractError("");
        } catch (e) {
            // console.error(e);
            // console.log(e);

            setIsSponsoredViaContractTxnProcessing(false);
            setIsSponsoredViaContractTxnId(null);
            setStepSponsoredViaContractError(e.message);
        }
    }

    async function verifyViaContract() {
        try {
            const addr = await queryWalletAddress();

            const verificationData = await getBrightIDSignature(addr);

            const contract = await getContractRw();

            // const addrs = [addr];
            const addrs = verificationData.data.contextIds;
            const timestamp = verificationData.data.timestamp;
            const v = verificationData.data.sig.v;
            const r = "0x" + verificationData.data.sig.r;
            const s = "0x" + verificationData.data.sig.s;

            // // console.log("-------------------------------");
            // // console.log(addrs);
            // // console.log(timestamp);
            // // console.log(v);
            // // console.log(r);
            // // console.log(s);
            // // console.log("-------------------------------");

            const tx = await contract.verify(addrs, timestamp, v, r, s);

            setIsVerifiedViaContractTxnProcessing(true);
            setIsVerifiedViaContractTxnId(tx.hash);
            setStepVerifyViaContractError("");

            // wait for the transaction to be mined
            await tx.wait();
            // const receipt = await tx.wait();
            // // console.log(receipt);

            // setIsVerifiedViaContract(true);

            await initIsVerifiedViaContract();

            setIsVerifiedViaContractTxnProcessing(false);
            setIsVerifiedViaContractTxnId(null);
            setStepVerifyViaContractError("");
        } catch (e) {
            // console.error(e);
            // console.log(e);

            setIsVerifiedViaContractTxnProcessing(false);
            setIsVerifiedViaContractTxnId(null);
            setStepVerifyViaContractError(e.message);
        }
    }

    async function checkBrightIDIdchainLink(contextId) {
        try {
            console.log("checkBrightIDIdchainLink");

            const userVerificationUrl = `${props.verificationUrl}/idchain/${contextId}?signed=null&timestamp=null`;

            // console.log(userVerificationUrl);

            const request = new Request(userVerificationUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
            });

            const response = await fetch(request);

            // console.log(response);

            return response.ok;
        } catch (e) {
            // console.error(e);
            // console.log(e);

            return false;
        }
    }

    async function checkBrightIDLink(contextId) {
        try {
            console.log("checkBrightIDLink");

            const userVerificationUrl = `${props.verificationUrl}/${props.context}/${contextId}?signed=null&timestamp=null`;

            // console.log(userVerificationUrl);

            const request = new Request(userVerificationUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
            });

            const response = await fetch(request);

            // console.log(response);

            return response.ok;
        } catch (e) {
            // console.error(e);
            // console.log(e);

            return false;
        }
    }

    async function checkBrightIDSponsorship(contextId) {
        try {
            console.log("checkBrightIDSponsorship");

            const userVerificationUrl = `${props.verificationUrl}/${props.context}/${contextId}?signed=eth&timestamp=seconds`;

            // console.log(userVerificationUrl);

            const request = new Request(userVerificationUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
            });

            const response = await fetch(request);

            // console.log(response);

            return response.ok;
        } catch (e) {
            // console.error(e);
            // console.log(e);

            return false;
        }
    }

    async function checkBrightIDVerification(contextId) {
        try {
            const addr = await queryWalletAddress();

            const contract = await getIdchainProviderContract();

            const isVerified = await contract.isVerifiedUser(addr);

            // console.log(isVerified);

            return isVerified;
        } catch (e) {
            // console.error(e);
            // console.log(e);

            return false;
        }
    }

    async function getBrightIDSignature(contextId) {
        try {
            const userVerificationUrl = `${props.verificationUrl}/${props.context}/${contextId}?signed=eth&timestamp=seconds`;

            // console.log(userVerificationUrl);

            const request = new Request(userVerificationUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
            });

            const response = await fetch(request);

            const body = await response.json();

            if (response.ok === false) {
                throw new Error(body.errorMessage);
            }

            return body;
        } catch (e) {
            throw new Error(e.message);
        }
    }

    async function faucetClaim() {
        try {
            const addr = await queryWalletAddress();

            const request = new Request(props.faucetClaimURL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
                body: JSON.stringify({ addr: addr }),
            });

            const response = await fetch(request);

            // console.log(response);

            if (response.ok === false) {
                throw new Error(`HTTP error, status = ${response.status}`);
            }

            setStepObtainGasTokensError("");

            return response.json();
        } catch (e) {
            // console.error(e);
            // console.log(e);

            setStepObtainGasTokensError(e.message);
        }
    }

    function stepInstallWalletStateComplete() {
        if (hasInstalledWallet() === true) {
            return "complete";
        }

        return "incomplete";
    }

    function stepConnecWalletStateComplete() {
        if (hasConnectedWallet() === true) {
            return "complete";
        }

        return "incomplete";
    }

    function stepBrightIDLinkedIdchainComplete() {
        if (hasBrightIDIdchainLinked() === true) {
            return "complete";
        }

        return "incomplete";
    }

    function stepBrightIDLinkedComplete() {
        if (hasBrightIDLinked() === true) {
            return "complete";
        }

        return "incomplete";
    }

    function stepSwitchToIDChainNetworkComplete() {
        if (hasSwitchedToIDChainNetwork() === true) {
            return "complete";
        }

        return "incomplete";
    }

    function stepObtainGasTokensComplete() {
        if (hasObtainedGasTokens() === true) {
            return "complete";
        }

        return "incomplete";
    }

    function stepSponsoredViaContractComplete() {
        if (hasSponsoredViaContract() === true) {
            return "complete";
        }

        return "incomplete";
    }

    function stepVerifyViaContractComplete() {
        if (hasVerifiedViaContract() === true) {
            return "complete";
        }

        return "incomplete";
    }

    function stepInstallWalletStateActive() {
        return "active";
    }

    function stepConnecWalletStateActive() {
        if (
            stepInstallWalletStateComplete() === "complete" &&
            stepInstallWalletStateActive() === "active"
        ) {
            return "active";
        }

        return "inactive";
    }

    function stepBrightIDLinkedIdchainActive() {
        if (
            stepConnecWalletStateComplete() === "complete" &&
            stepConnecWalletStateActive() === "active"
        ) {
            return "active";
        }

        return "inactive";
    }

    function stepBrightIDLinkedActive() {
        if (
            stepBrightIDLinkedIdchainComplete() === "complete" &&
            stepBrightIDLinkedIdchainActive() === "active"
        ) {
            return "active";
        }

        return "inactive";
    }

    function stepSwitchToIDChainNetworkActive() {
        if (
            stepBrightIDLinkedComplete() === "complete" &&
            stepBrightIDLinkedActive() === "active"
        ) {
            return "active";
        }

        return "inactive";
    }

    function stepObtainGasTokensActive() {
        if (
            stepSwitchToIDChainNetworkComplete() === "complete" &&
            stepSwitchToIDChainNetworkActive() === "active"
        ) {
            return "active";
        }

        return "inactive";
    }

    function stepSponsoredViaContractActive() {
        if (
            stepObtainGasTokensComplete() === "complete" &&
            stepObtainGasTokensActive() === "active"
        ) {
            return "active";
        }

        return "inactive";
    }

    function stepVerifyViaContractActive() {
        if (
            stepSponsoredViaContractComplete() === "complete" &&
            stepSponsoredViaContractActive() === "active"
        ) {
            return "active";
        }

        return "inactive";
    }

    async function onAccountChange() {
        setBrightIDVerification({
            isBrightIDIdchainLinked: false,
            isBrightIDLinked: false,
            isSponsoredViaContract: false,
        });

        setIsVerifiedViaContract(false);

        await initWalletAddress();
        await initChainId();
        await initGasBalance();
    }

    async function onChainChanged() {
        await initChainId();
    }

    async function attachProviderListeners() {
        // console.log("attach listeners");

        const provider = await getInstance();

        provider.on("accountsChanged", onAccountChange);
        provider.on("chainChanged", onChainChanged);
    }

    async function detachProviderListeners() {
        // console.log("remove listeners");

        const provider = await getInstance();

        provider.removeListener("accountsChanged", onAccountChange);
        provider.removeListener("chainChanged", onChainChanged);
    }

    useEffect(() => {
        if (isConnected === false) {
            return;
        }

        if (
            brightIDVerification.isBrightIDIdchainLinked === true &&
            brightIDVerification.isBrightIDLinked === true &&
            brightIDVerification.isSponsoredViaContract === true
        ) {
            return;
        }

        initIsBrightIDVerifications();

        const remoteVerificationRefresh = setInterval(
            initIsBrightIDVerifications,
            5000
        );

        return () => {
            clearInterval(remoteVerificationRefresh);
        };
    }, [brightIDVerification]); // eslint-disable-line

    useEffect(() => {
        if (isConnected === false) {
            return;
        }

        if (isVerifiedViaContract === true) {
            return;
        }

        initIsVerifiedViaContract();

        const remoteVerificationRefresh = setInterval(
            initIsVerifiedViaContract,
            5000
        );

        return () => {
            clearInterval(remoteVerificationRefresh);
        };
    }, [isVerifiedViaContract]); // eslint-disable-line

    useEffect(() => {
        if (isConnected === false) {
            return;
        }

        onAccountChange();
        attachProviderListeners();
        const monitorGasBalance = setInterval(initGasBalance, 5000);

        return () => {
            detachProviderListeners();
            clearInterval(monitorGasBalance);
        };
    }, [isConnected]); // eslint-disable-line

    useEffect(() => {
        if (firstUpdate.current === false) {
            return;
        }

        if (firstUpdate.current) {
            firstUpdate.current = false;
        }

        const cachedProviderName = getProviderType();

        if (
            cachedProviderName === "injected" ||
            cachedProviderName === "walletconnect"
        ) {
            connectWallet();
        }

        // if (cachedProviderName === "injected") {
        //     connectWallet();
        // }

        // if (cachedProviderName === "walletconnect") {
        //     localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");
        //     localStorage.removeItem("walletconnect");
        // }
    });

    return (
        <div className="idchain-registration">
            <div>
                <section className={`idchain-registration-step`}>
                    <div className="idchain-registration-step__main">
                        <div className="idchain-registration-step__header">
                            <h2 className="idchain-registration-step__heading">
                                Install BrightID
                            </h2>
                        </div>
                        <div className="idchain-registration-step__action idchain-registration-step__action--app-store">
                            <div>
                                <a
                                    href={props.appStoreAndroid}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                >
                                    <img
                                        className="idchain-registration-step__app-store-image"
                                        src={googlePlay}
                                        alt="Get it on Google Play"
                                    />
                                </a>
                            </div>
                            <div>
                                <a
                                    href={props.appStoreIos}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                >
                                    <img
                                        className="idchain-registration-step__app-store-image"
                                        src={appStore}
                                        alt="Download on App Store"
                                    />
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="idchain-registration-step__description">
                        <p className="idchain-registration-step__description-p">
                            The first step is to install the BrightID app on
                            your mobile device.
                        </p>
                    </div>
                </section>
                <section className={`idchain-registration-step`}>
                    <div className="idchain-registration-step__main">
                        <div className="idchain-registration-step__header">
                            <h2 className="idchain-registration-step__heading">
                                Verify with BrightID
                            </h2>
                        </div>
                        <div className="idchain-registration-step__action">
                            <button
                                className="idchain-registration-step__button"
                                onClick={() => verifyWithBrightID()}
                            >
                                Find Party
                            </button>
                        </div>
                    </div>
                    <div className="idchain-registration-step__description">
                        <p className="idchain-registration-step__description-p">
                            Once you have BrightID installed you need to join a
                            verification party to become verified.
                        </p>
                    </div>
                </section>
                {/* <section
                    className={`
                        idchain-registration-step
                        idchain-registration-step--install
                        idchain-registration-step--${stepInstallWalletStateComplete()}
                        idchain-registration-step--${stepInstallWalletStateActive()}
                    `}
                >
                    <div className="idchain-registration-step__main">
                        <div className="idchain-registration-step__status">
                            <div className="idchain-registration-step__status-icon"></div>
                        </div>
                        <div className="idchain-registration-step__header">
                            <h2 className="idchain-registration-step__heading">
                                Install a Wallet
                            </h2>
                        </div>
                        <div className="idchain-registration-step__action">
                            <button
                                className="idchain-registration-step__button"
                                onClick={() => installWallet()}
                            >
                                Install
                            </button>
                        </div>
                    </div>
                </section> */}
                <section
                    className={`
                        idchain-registration-step
                        idchain-registration-step--connect
                        idchain-registration-step--${stepConnecWalletStateComplete()}
                        idchain-registration-step--${stepConnecWalletStateActive()}
                    `}
                >
                    <div className="idchain-registration-step__main">
                        <div className="idchain-registration-step__status">
                            <div className="idchain-registration-step__status-icon"></div>
                        </div>
                        <div className="idchain-registration-step__header">
                            <h2 className="idchain-registration-step__heading">
                                Connect Wallet
                            </h2>
                        </div>
                        <div className="idchain-registration-step__action">
                            <button
                                className="idchain-registration-step__button"
                                onClick={() => chooseWallet()}
                            >
                                Connect
                            </button>
                        </div>
                    </div>
                    <div className="idchain-registration-step__description">
                        {ens && (
                            <p className="idchain-registration-step__description-p">
                                <strong>ENS: </strong>
                                <span className="idchain-registration-step__description-ens-address">
                                    {ens}
                                </span>
                            </p>
                        )}
                        {walletAddress && (
                            <p className="idchain-registration-step__description-p">
                                <strong>Address: </strong>
                                <span className="idchain-registration-step__description-wallet-address">
                                    {walletAddress}
                                </span>
                            </p>
                        )}
                        {!walletAddress && (
                            <p className="idchain-registration-step__description-p">
                                <strong>Address: </strong>
                                <span>Not Connected</span>
                            </p>
                        )}
                    </div>
                    <div className="idchain-registration-step__feedback">
                        {stepConnecWalletStateError && (
                            <div className="idchain-registration-step__response idchain-registration-step__response--error">
                                {stepConnecWalletStateError}
                            </div>
                        )}
                    </div>
                </section>
                <section
                    className={`
                        idchain-registration-step
                        idchain-registration-step--brightid-link-idchain
                        idchain-registration-step--${stepBrightIDLinkedIdchainComplete()}
                        idchain-registration-step--${stepBrightIDLinkedIdchainActive()}
                    `}
                >
                    <div className="idchain-registration-step__main">
                        <div className="idchain-registration-step__status">
                            <div className="idchain-registration-step__status-icon"></div>
                        </div>
                        <div className="idchain-registration-step__header">
                            <h2 className="idchain-registration-step__heading">
                                Link Wallet to IDChain
                            </h2>
                        </div>
                        <div className="idchain-registration-step__action">
                            {/* <button
                                className="idchain-registration-step__button"
                                onClick={() => linkAddressToBrightIDIdchain()}
                            >
                                Link Address
                            </button> */}
                        </div>
                    </div>
                    <div
                        className="
                            idchain-registration-step__description
                            idchain-registration-step__description--action
                            idchain-registration-step__description--action-hide-on-complete
                        "
                    >
                        <p className="idchain-registration-step__description-p">
                            If you're on your mobile device just use this button
                            to open BrightID and link your wallet.
                        </p>
                        <p className="idchain-registration-step__description-button-container">
                            <button
                                className="idchain-registration-step__button"
                                onClick={() => linkAddressToBrightIDIdchain()}
                            >
                                Link Address
                            </button>
                        </p>
                        <p className="idchain-registration-step__description-p">
                            If you're on desktop, scan the QR code below with
                            the "Scan a Code" button in the BrightID mobile app.
                        </p>
                        <p className="idchain-registration-step__description-qrcode-container">
                            <QRCode
                                renderAs="svg"
                                size={200}
                                value={qrCodeUrlIdchain}
                            />
                        </p>
                    </div>
                    <div className="idchain-registration-step__feedback"></div>
                </section>
                <section
                    className={`
                        idchain-registration-step
                        idchain-registration-step--brightid-link
                        idchain-registration-step--${stepBrightIDLinkedComplete()}
                        idchain-registration-step--${stepBrightIDLinkedActive()}
                    `}
                >
                    <div className="idchain-registration-step__main">
                        <div className="idchain-registration-step__status">
                            <div className="idchain-registration-step__status-icon"></div>
                        </div>
                        <div className="idchain-registration-step__header">
                            <h2 className="idchain-registration-step__heading">
                                Link Wallet to Snapshot
                            </h2>
                        </div>
                        <div className="idchain-registration-step__action">
                            {/* <button
                                className="idchain-registration-step__button"
                                onClick={() => linkAddressToBrightID()}
                            >
                                Link Address
                            </button> */}
                        </div>
                    </div>
                    <div
                        className="
                            idchain-registration-step__description
                            idchain-registration-step__description--action
                            idchain-registration-step__description--action-hide-on-complete
                        "
                    >
                        <p className="idchain-registration-step__description-p">
                            If you're on your mobile device just use this button
                            to open BrightID and link your wallet.
                        </p>
                        <p className="idchain-registration-step__description-button-container">
                            <button
                                className="idchain-registration-step__button"
                                onClick={() => linkAddressToBrightID()}
                            >
                                Link Address
                            </button>
                        </p>
                        <p className="idchain-registration-step__description-p">
                            If you're on desktop, scan the QR code below with
                            the "Scan a Code" button in the BrightID mobile app.
                        </p>
                        <p className="idchain-registration-step__description-qrcode-container">
                            <QRCode
                                renderAs="svg"
                                size={200}
                                value={qrCodeUrl}
                            />
                        </p>
                    </div>
                    <div className="idchain-registration-step__feedback"></div>
                </section>
                <section
                    className={`
                        idchain-registration-step
                        idchain-registration-step--${stepSwitchToIDChainNetworkComplete()}
                        idchain-registration-step--${stepSwitchToIDChainNetworkActive()}
                    `}
                >
                    <div className="idchain-registration-step__main">
                        <div className="idchain-registration-step__status">
                            <div className="idchain-registration-step__status-icon"></div>
                        </div>
                        <div className="idchain-registration-step__header">
                            <h2 className="idchain-registration-step__heading">
                                Switch Wallet to IDChain Network
                            </h2>
                        </div>
                        <div className="idchain-registration-step__action">
                            {canAutoSwitchNetworks() && (
                                <button
                                    className="idchain-registration-step__button"
                                    onClick={() => switchToIDChainNetwork()}
                                >
                                    Switch
                                </button>
                            )}
                        </div>
                    </div>
                    {!canAutoSwitchNetworks() && (
                        <div
                            className="
                                idchain-registration-step__description
                                idchain-registration-step__description--action
                                idchain-registration-step__description--action-hide-on-complete
                            "
                        >
                            <p className="idchain-registration-step__description-p">
                                In your wallet app create a new network with the
                                following data and switch to that network.
                            </p>
                            <p className="idchain-registration-step__description-p">
                                <strong>Network Name: </strong>
                                {props.registrationChainName}
                            </p>
                            <p className="idchain-registration-step__description-p">
                                <strong>RPC URL: </strong>
                                {props.registrationRpcUrl}
                            </p>
                            <p className="idchain-registration-step__description-p">
                                <strong>Chain ID: </strong>
                                {props.registrationChainId}
                            </p>
                            <p className="idchain-registration-step__description-p">
                                <strong>Currency Symbol: </strong>
                                {props.registrationTokenName}
                            </p>
                            <p className="idchain-registration-step__description-p">
                                <strong>Block Explorer URL: </strong>
                                {props.registrationBlockExplorerUrl}
                            </p>
                        </div>
                    )}
                    <div className="idchain-registration-step__feedback">
                        {stepSwitchToIDChainNetworkError && (
                            <div className="idchain-registration-step__response idchain-registration-step__response--error">
                                {stepSwitchToIDChainNetworkError}
                            </div>
                        )}
                    </div>
                </section>
                <section
                    className={`
                        idchain-registration-step
                        idchain-registration-step--${stepObtainGasTokensComplete()}
                        idchain-registration-step--${stepObtainGasTokensActive()}
                    `}
                >
                    <div className="idchain-registration-step__main">
                        <div className="idchain-registration-step__status">
                            <div className="idchain-registration-step__status-icon"></div>
                        </div>
                        <div className="idchain-registration-step__header">
                            <h2 className="idchain-registration-step__heading">
                                Obtain IDChain Network Gas Tokens
                            </h2>
                        </div>
                        <div className="idchain-registration-step__action">
                            <button
                                className="idchain-registration-step__button"
                                onClick={() => faucetClaim()}
                            >
                                Obtain
                            </button>
                        </div>
                    </div>
                    <div className="idchain-registration-step__description">
                        <p className="idchain-registration-step__description-p">
                            <strong>Balance: </strong>
                            <span className="idchain-registration-step__description-balance">
                                {gasBalance} {props.registrationTokenName}
                            </span>
                        </p>
                    </div>
                    <div className="idchain-registration-step__feedback">
                        {stepObtainGasTokensError && (
                            <div className="idchain-registration-step__response idchain-registration-step__response--error">
                                {stepObtainGasTokensError}
                            </div>
                        )}
                    </div>
                </section>
                <section
                    className={`
                        idchain-registration-step
                        idchain-registration-step--${stepSponsoredViaContractComplete()}
                        idchain-registration-step--${stepSponsoredViaContractActive()}
                    `}
                >
                    <div className="idchain-registration-step__main">
                        <div className="idchain-registration-step__status">
                            <div className="idchain-registration-step__status-icon"></div>
                        </div>
                        <div className="idchain-registration-step__header">
                            <h2 className="idchain-registration-step__heading">
                                Become Sponsored on IDChain
                            </h2>
                        </div>
                        <div className="idchain-registration-step__action">
                            <button
                                className="idchain-registration-step__button"
                                onClick={() => sponsorViaContract()}
                            >
                                Go
                            </button>
                        </div>
                    </div>
                    <div
                        className="
                            idchain-registration-step__description
                            idchain-registration-step__description--action
                            idchain-registration-step__description--action-hide-on-complete
                        "
                    >
                        <p className="idchain-registration-step__description-p">
                            This should happen automatically, but if not you can
                            manually put the transaction through with the button
                            in this step.
                        </p>
                    </div>
                    <div className="idchain-registration-step__feedback">
                        {isSponsoredViaContractTxnProcessing && (
                            <div className="idchain-registration-step__response">
                                <div className="idchain-registration-step__response-loading-icon">
                                    <div className="idchain-registration-step__loading-icon">
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                    </div>
                                </div>
                                <div className="idchain-registration-step__response-message">
                                    <div>Transaction is being processed...</div>
                                    <div>
                                        <a
                                            className="idchain-registration-step__response-link"
                                            href={`${props.registrationBlockExplorerUrl}${props.registrationBlockExplorerTxnPath}${isSponsoredViaContractTxnId}`}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            View Transaction
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}
                        {stepSponsoredViaContractError && (
                            <div className="idchain-registration-step__response idchain-registration-step__response--error">
                                {stepSponsoredViaContractError}
                            </div>
                        )}
                    </div>
                </section>
                <section
                    className={`
                        idchain-registration-step
                        idchain-registration-step--${stepVerifyViaContractComplete()}
                        idchain-registration-step--${stepVerifyViaContractActive()}
                    `}
                >
                    <div className="idchain-registration-step__main">
                        <div className="idchain-registration-step__status">
                            <div className="idchain-registration-step__status-icon"></div>
                        </div>
                        <div className="idchain-registration-step__header">
                            <h2 className="idchain-registration-step__heading">
                                Verify with Song a Day on IDChain
                            </h2>
                        </div>
                        <div className="idchain-registration-step__action">
                            <button
                                className="idchain-registration-step__button"
                                onClick={() => verifyViaContract()}
                            >
                                Verify
                            </button>
                        </div>
                    </div>
                    <div className="idchain-registration-step__feedback">
                        {isVerifiedViaContractTxnProcessing && (
                            <div className="idchain-registration-step__response">
                                <div className="idchain-registration-step__response-loading-icon">
                                    <div className="idchain-registration-step__loading-icon">
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                    </div>
                                </div>
                                <div className="idchain-registration-step__response-message">
                                    <div>Transaction is being processed...</div>
                                    <div>
                                        <a
                                            className="idchain-registration-step__response-link"
                                            href={`${props.registrationBlockExplorerUrl}${props.registrationBlockExplorerTxnPath}${isVerifiedViaContractTxnId}`}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            View Transaction
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}
                        {stepVerifyViaContractError && (
                            <div className="idchain-registration-step__response idchain-registration-step__response--error">
                                {stepVerifyViaContractError}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default IdchainRegistration;
