import googlePlay from "./google-play.png";
import appStore from "./app-store.png";
import "./IdchainRegistration.css";
import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode.react";
import { ethers } from "ethers";

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
            name: "AppSet",
            inputs: [
                {
                    type: "bytes32",
                    name: "_app",
                    internalType: "bytes32",
                    indexed: false,
                },
            ],
            anonymous: false,
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
            name: "setApp",
            inputs: [
                { type: "bytes32", name: "_app", internalType: "bytes32" },
            ],
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
                {
                    type: "address",
                    name: "newOwner",
                    internalType: "address",
                },
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
                {
                    type: "address",
                    name: "",
                    internalType: "contract IERC20",
                },
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
                {
                    type: "address[]",
                    name: "addrs",
                    internalType: "address[]",
                },
                {
                    type: "uint256",
                    name: "timestamp",
                    internalType: "uint256",
                },
                { type: "uint8", name: "v", internalType: "uint8" },
                { type: "bytes32", name: "r", internalType: "bytes32" },
                { type: "bytes32", name: "s", internalType: "bytes32" },
            ],
        },
    ];

    const [qrCodeUrl, setQrCodeUrl] = useState("");

    const [walletAddress, setWalletAddress] = useState("");

    const [ens, setENS] = useState("");

    const [chainId, setChainId] = useState("");

    const [gasBalance, setGasBalance] = useState(0.0);

    const [isBrightIDLinked, setIsBrightIDLinked] = useState(false);

    const [isSponsoredViaContract, setIsSponsoredViaContract] = useState(false);

    const [isVerifiedViaContract, setIsVerifiedViaContract] = useState(false);

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

    function hasWeb3Support() {
        return typeof window.ethereum !== "undefined";
    }

    function hasInstalledWallet() {
        return hasWeb3Support() === true;
    }

    function hasConnectedWallet() {
        return walletAddress !== "";
    }

    function hasBrightIDLinked() {
        return isBrightIDLinked === true;
    }

    function hasSponsoredViaContract() {
        return isSponsoredViaContract === true;
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

    function getProvider() {
        return new ethers.providers.Web3Provider(window.ethereum);
    }

    function getMainnetProvider() {
        return new ethers.providers.JsonRpcProvider(props.mainnetRpcUrl);
    }

    // function getContract() {
    //     const provider = getProvider();

    //     return new ethers.Contract(props.contractAddr, contractAbi, provider);
    // }

    function getContractRw() {
        const provider = getProvider();

        return new ethers.Contract(
            props.contractAddr,
            contractAbi,
            provider.getSigner()
        );
    }

    function updateWalletAddress(addr) {
        updateENS(addr);
        setWalletAddress(addr);
        setQrCodeUrl(`${props.deepLinkPrefix}/${props.context}/${addr}`);
    }

    async function updateENS(addr) {
        var ens = await queryENS();

        setENS(ens);
    }

    function installWallet() {
        window.open("https://metamask.io/", "_blank");
    }

    function verifyWithBrightID() {
        window.open(props.brightIdMeetUrl, "_blank");
    }

    function linkAddressToBrightID() {
        window.open(qrCodeUrl);
    }

    async function connectWallet() {
        try {
            const provider = getProvider();

            await provider.send("eth_requestAccounts", []);

            const addr = await provider.getSigner().getAddress();

            console.log(addr);

            updateWalletAddress(addr);

            setStepConnecWalletStateError("");
        } catch (e) {
            console.error(e);
            console.log(e);

            setStepConnecWalletStateError(e.message);
        }
    }

    async function queryWalletAddress() {
        const provider = getProvider();

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

            console.log(name);

            return name;
        } catch (e) {
            console.error(e);
            console.log(e);
        }
    }

    async function initWalletAddress() {
        try {
            const addr = await queryWalletAddress();

            console.log(addr);

            updateWalletAddress(addr);
        } catch (e) {
            console.error(e);
            console.log(e);
        }
    }

    async function initChainId() {
        try {
            const provider = getProvider();

            const { chainId } = await provider.getNetwork();

            console.log(chainId);

            setChainId(chainId);
        } catch (e) {
            console.error(e);
            console.log(e);
        }
    }

    async function initGasBalance() {
        try {
            const provider = getProvider();

            const { chainId } = await provider.getNetwork();

            if (chainId !== Number(props.registrationChainId)) {
                throw new Error("Not on IDChain Network");
            }

            const addr = await queryWalletAddress();

            const balanceRaw = await provider.getBalance(addr);

            const balance = ethers.utils.formatEther(balanceRaw);

            console.log(balance);

            setGasBalance(balance);
        } catch (e) {
            console.error(e);
            console.log(e);

            setGasBalance(0);
        }
    }

    async function initIsBrightIDLinked() {
        try {
            const addr = await queryWalletAddress();

            const isBrightIDLinked = await checkBrightIDLink(addr);

            console.log(isBrightIDLinked);

            setIsBrightIDLinked(isBrightIDLinked);
        } catch (e) {
            console.error(e);
            console.log(e);

            setIsBrightIDLinked(false);
        }
    }

    async function initIsSponsoredViaContract() {
        try {
            const addr = await queryWalletAddress();

            const isSponsoredViaContract = await checkBrightIDSponsorship(addr);

            console.log(isSponsoredViaContract);

            setIsSponsoredViaContract(isSponsoredViaContract);
        } catch (e) {
            console.error(e);
            console.log(e);

            setIsSponsoredViaContract(false);
        }
    }

    async function switchToIDChainNetwork() {
        const registrationHexChainId = ethers.utils.hexlify(
            Number(props.registrationChainId)
        );

        try {
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: registrationHexChainId }],
            });

            setStepSwitchToIDChainNetworkError("");
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [
                            {
                                chainId: props.registrationHexChainId,
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
                    console.error(addError);
                    console.log(addError);

                    setStepSwitchToIDChainNetworkError(addError.message);
                }

                return;
            }

            console.error(switchError);
            console.log(switchError);

            setStepSwitchToIDChainNetworkError(switchError.message);
        }
    }

    async function sponsorViaContract() {
        try {
            const addr = await queryWalletAddress();

            const contract = getContractRw();

            const tx = await contract.sponsor(addr);

            setIsSponsoredViaContractTxnProcessing(true);
            setIsSponsoredViaContractTxnId(tx.hash);
            setStepSponsoredViaContractError("");

            // wait for the transaction to be mined
            await tx.wait();
            // const receipt = await tx.wait();
            // console.log(receipt);

            setIsSponsoredViaContractTxnProcessing(false);
            setIsSponsoredViaContractTxnId(null);
            setStepSponsoredViaContractError("");
        } catch (e) {
            console.error(e);
            console.log(e);

            setIsSponsoredViaContractTxnProcessing(false);
            setIsSponsoredViaContractTxnId(null);
            setStepSponsoredViaContractError(e.message);
        }
    }

    async function verifyViaContract() {
        try {
            const addr = await queryWalletAddress();

            const verificationData = await getBrightIDSignature(addr);

            const contract = getContractRw();

            // const addrs = [addr];
            const addrs = verificationData.data.contextIds;
            const timestamp = verificationData.data.timestamp;
            const v = verificationData.data.sig.v;
            const r = "0x" + verificationData.data.sig.r;
            const s = "0x" + verificationData.data.sig.s;

            // console.log("-------------------------------");
            // console.log(addrs);
            // console.log(timestamp);
            // console.log(v);
            // console.log(r);
            // console.log(s);
            // console.log("-------------------------------");

            const tx = await contract.verify(addrs, timestamp, v, r, s);

            setIsVerifiedViaContractTxnProcessing(true);
            setIsVerifiedViaContractTxnId(tx.hash);
            setStepVerifyViaContractError("");

            // wait for the transaction to be mined
            await tx.wait();
            // const receipt = await tx.wait();
            // console.log(receipt);

            // setIsVerifiedViaContract(true);

            setIsVerifiedViaContractTxnProcessing(false);
            setIsVerifiedViaContractTxnId(null);
            setStepVerifyViaContractError("");
        } catch (e) {
            console.error(e);
            console.log(e);

            setIsVerifiedViaContractTxnProcessing(false);
            setIsVerifiedViaContractTxnId(null);
            setStepVerifyViaContractError(e.message);
        }
    }

    async function checkBrightIDLink(contextId) {
        try {
            const userVerificationUrl = `${props.verificationUrl}/${props.context}/${contextId}?signed=null&timestamp=null`;

            console.log(userVerificationUrl);

            const request = new Request(userVerificationUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
            });

            const response = await fetch(request);

            console.log(response);

            return response.ok;
        } catch (e) {
            console.error(e);
            console.log(e);

            return false;
        }
    }

    async function checkBrightIDSponsorship(contextId) {
        try {
            const userVerificationUrl = `${props.verificationUrl}/${props.context}/${contextId}?signed=eth&timestamp=seconds`;

            console.log(userVerificationUrl);

            const request = new Request(userVerificationUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
            });

            const response = await fetch(request);

            console.log(response);

            return response.ok;
        } catch (e) {
            console.error(e);
            console.log(e);

            return false;
        }
    }

    async function getBrightIDSignature(contextId) {
        try {
            const userVerificationUrl = `${props.verificationUrl}/${props.context}/${contextId}?signed=eth&timestamp=seconds`;

            console.log(userVerificationUrl);

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

            console.log(response);

            if (response.ok === false) {
                throw new Error(`HTTP error, status = ${response.status}`);
            }

            setStepObtainGasTokensError("");

            return response.json();
        } catch (e) {
            console.error(e);
            console.log(e);

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

    function stepBrightIDLinkedActive() {
        if (
            stepConnecWalletStateComplete() === "complete" &&
            stepConnecWalletStateActive() === "active"
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

    function refreshWalletState() {
        if (hasWeb3Support() === false) {
            return;
        }

        console.log("refresh");
        initWalletAddress();
        initChainId();
        initGasBalance();
        initIsBrightIDLinked();
        initIsSponsoredViaContract();
    }

    function resetRemoteVerifications() {
        console.log("reset remote");
        setIsBrightIDLinked(false);
        setIsSponsoredViaContract(false);
        setIsVerifiedViaContract(false);
    }

    useEffect(() => {
        if (hasWeb3Support() === false) {
            return;
        }

        // console.log("attach listeners");

        window.ethereum.on("accountsChanged", resetRemoteVerifications);
        window.ethereum.on("chainChanged", resetRemoteVerifications);

        window.ethereum.on("accountsChanged", refreshWalletState);
        window.ethereum.on("chainChanged", refreshWalletState);

        return () => {
            // console.log("remove listeners");

            window.ethereum.removeListener(
                "accountsChanged",
                resetRemoteVerifications
            );
            window.ethereum.removeListener(
                "chainChanged",
                resetRemoteVerifications
            );

            window.ethereum.removeListener(
                "accountsChanged",
                refreshWalletState
            );
            window.ethereum.removeListener("chainChanged", refreshWalletState);
        };
    });

    useEffect(() => {
        if (isBrightIDLinked === true) {
            return;
        }

        const remoteVerificationRefresh = setInterval(
            initIsBrightIDLinked,
            5000
        );

        return () => {
            clearInterval(remoteVerificationRefresh);
        };
    }, [isBrightIDLinked]); // eslint-disable-line

    useEffect(() => {
        if (isSponsoredViaContract === true) {
            return;
        }

        const remoteVerificationRefresh = setInterval(
            initIsSponsoredViaContract,
            5000
        );

        return () => {
            clearInterval(remoteVerificationRefresh);
        };
    }, [isSponsoredViaContract]); // eslint-disable-line

    useEffect(() => {
        const monitorGasBalance = setInterval(initGasBalance, 5000);

        return () => {
            clearInterval(monitorGasBalance);
        };
    });

    useEffect(() => {
        if (firstUpdate.current === false) {
            return;
        }

        if (firstUpdate.current) {
            firstUpdate.current = false;
        }

        refreshWalletState();
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
                <section
                    className={`
                        idchain-registration-step
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
                </section>
                <section
                    className={`
                        idchain-registration-step
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
                                onClick={() => connectWallet()}
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
                                Link Wallet to BrightID
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
                    <div className="idchain-registration-step__description step__description--action">
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
                            <button
                                className="idchain-registration-step__button"
                                onClick={() => switchToIDChainNetwork()}
                            >
                                Switch
                            </button>
                        </div>
                    </div>
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
