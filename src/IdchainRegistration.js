import googlePlay from "./google-play.png";
import appStore from "./app-store.png";
import "./IdchainRegistration.css";
import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode.react";
import IdchainRegistrationModel from "./IdchainRegistrationModel";
import DeepLinker from "./DeepLinker";

let registration;

let changePollingInterval = 0;

function IdchainRegistration(props) {
    /* State */
    /* ---------------------------------------------------------------------- */

    const firstUpdate = useRef(true);

    const [walletAddress, setWalletAddress] = useState("");

    const [ensName, setENSName] = useState("");

    const [chainId, setChainId] = useState("");

    const [gasBalance, setGasBalance] = useState(0.0);

    const [canAutoSwitchNetworks, setCanAutoSwitchNetworks] = useState(false);

    const [qrCodeUrl, setQrCodeUrl] = useState("");

    const [qrCodeIdchainUrl, setQrCodeIdchainUrl] = useState("");

    const [isBrightIDIdchainLinked, setIsBrightIDIdchainLinked] =
        useState(false);

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

    const [stepConnecWalletError, setStepConnecWalletError] = useState("");

    const [
        stepSwitchToIDChainNetworkError,
        setStepSwitchToIDChainNetworkError,
    ] = useState("");

    const [stepObtainGasTokensError, setStepObtainGasTokensError] =
        useState("");

    const [stepObtainGasTokensStatus, setStepObtainGasTokensStatus] =
        useState("");

    const [stepSponsoredViaContractError, setStepSponsoredViaContractError] =
        useState("");

    const [stepVerifyViaContractError, setStepVerifyViaContractError] =
        useState("");

    const [
        linkAddressToBrightIDIdchainError,
        setLinkAddressToBrightIDIdchainError,
    ] = useState("");

    const [linkAddressToBrightIDError, setLinkAddressToBrightIDError] =
        useState("");

    /* Util */
    /* ---------------------------------------------------------------------- */

    function timeout(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /* Web3 Data Init & Monitoring */
    /* ---------------------------------------------------------------------- */

    async function onAccountChange() {
        registration.resetWalletData();
        initWalletAddress();
        initENSName();
        initChainId();
        initGasBalance();
        initCanAutoSwitchNetworks();
        initQrCodeUrl();
        initQrCodeIdchainUrl();
        initIsBrightIDVerifications();
        initIsVerifiedViaContract();
    }

    function onChainChanged() {
        initChainId();
    }

    function onChangePolling() {
        if (registration.gasBalance === 0 || registration.gasBalance === 0.0) {
            initGasBalance();
        }

        if (
            registration.isBrightIDIdchainLinked === false ||
            registration.isBrightIDLinked === false ||
            registration.isSponsoredViaContract === false
        ) {
            initIsBrightIDVerifications();
        }

        if (
            registration.isBrightIDLinked === true &&
            registration.isSponsoredViaContract === true &&
            registration.isVerifiedViaContract === false
        ) {
            initIsVerifiedViaContract();
        }
    }

    function removeEvents() {
        console.log("remove events");

        if (typeof registration.web3Instance === "object") {
            registration.web3Instance.removeListener(
                "accountsChanged",
                onAccountChange
            );

            registration.web3Instance.removeListener(
                "chainChanged",
                onChainChanged
            );
        }

        if (changePollingInterval) {
            clearInterval(changePollingInterval);
        }
    }

    function addEvents() {
        console.log("add events");

        if (typeof registration.web3Instance === "object") {
            registration.web3Instance.on("accountsChanged", onAccountChange);

            registration.web3Instance.on("chainChanged", onChainChanged);
        }

        changePollingInterval = setInterval(onChangePolling, 5000);
    }

    /* State Data Query */
    /* ---------------------------------------------------------------------- */

    async function initWalletAddress() {
        try {
            const walletAddress = await registration.initWalletAddress();

            setWalletAddress(walletAddress);
        } catch (e) {
            // console.error(e);
            // console.log(e);
        }
    }

    async function initENSName() {
        try {
            const ensName = await registration.initENSName();

            setENSName(ensName);
        } catch (e) {
            // console.error(e);
            // console.log(e);
        }
    }

    async function initChainId() {
        try {
            const chainId = await registration.initChainId();

            setChainId(chainId);
        } catch (e) {
            // console.error(e);
            // console.log(e);
        }
    }

    async function initGasBalance() {
        try {
            const gasBalance = await registration.initGasBalance();

            setGasBalance(gasBalance);

            if (gasBalance > 0) {
                setStepObtainGasTokensStatus("");
                setStepObtainGasTokensError("");
            }
        } catch (e) {
            // console.error(e);
            // console.log(e);
        }
    }

    async function initCanAutoSwitchNetworks() {
        try {
            const canAutoSwitchNetworks =
                await registration.canAutoSwitchNetworks();

            setCanAutoSwitchNetworks(canAutoSwitchNetworks);
        } catch (e) {
            // console.error(e);
            // console.log(e);
        }
    }

    async function initQrCodeUrl() {
        try {
            const qrCodeUrl = await registration.getQrCodeUrl();

            setQrCodeUrl(qrCodeUrl);
        } catch (e) {
            // console.error(e);
            // console.log(e);
        }
    }

    async function initQrCodeIdchainUrl() {
        try {
            const qrCodeUrl = await registration.getQrCodeIdchainUrl();

            setQrCodeIdchainUrl(qrCodeUrl);
        } catch (e) {
            // console.error(e);
            // console.log(e);
        }
    }

    async function initIsBrightIDVerifications() {
        try {
            if (registration.isBrightIDIdchainLinked === false) {
                const isBrightIDIdchainLinked =
                    await registration.initIsBrightIDIdchainLinked();

                setIsBrightIDIdchainLinked(isBrightIDIdchainLinked);

                await timeout(1000);
            }

            if (registration.isBrightIDLinked === false) {
                const isBrightIDLinked =
                    await registration.initIsBrightIDLinked();

                setIsBrightIDLinked(isBrightIDLinked);
            }

            if (
                registration.isBrightIDLinked === true &&
                registration.isSponsoredViaContract === false
            ) {
                await timeout(1000);

                const isSponsoredViaContract =
                    await registration.initIsSponsoredViaContract();

                setIsSponsoredViaContract(isSponsoredViaContract);
            }
        } catch (e) {
            // console.error(e);
            // console.log(e);
        }
    }

    async function initIsSponsoredViaContract() {
        try {
            const isSponsoredViaContract =
                await registration.initIsSponsoredViaContract();

            // console.log(isSponsoredViaContract);

            setIsSponsoredViaContract(isSponsoredViaContract);
        } catch (e) {
            // console.error(e);
            // console.log(e);
        }
    }

    async function initIsVerifiedViaContract() {
        try {
            const isVerifiedViaContract =
                await registration.initIsVerifiedViaContract();

            // console.log(isVerifiedViaContract);

            setIsVerifiedViaContract(isVerifiedViaContract);
        } catch (e) {
            // console.error(e);
            // console.log(e);
        }
    }

    /* Interactive Events */
    /* ---------------------------------------------------------------------- */

    function verifyWithBrightID() {
        window.open(props.brightIdMeetUrl, "_blank");
    }

    function linkAddressToBrightIDIdchain() {
        // window.open(qrCodeIdchainUrl);

        var url = qrCodeIdchainUrl;

        if (url === "") {
            return;
        }

        var linker = new DeepLinker({
            onIgnored: function () {
                console.log("browser failed to respond to the deep link");

                setLinkAddressToBrightIDIdchainError(
                    "Couldn't open BrightID. Scan the QR code below with the device you have BrightID installed on."
                );
            },
            onFallback: function () {
                console.log("dialog hidden or user returned to tab");
            },
            onReturn: function () {
                console.log("user returned to the page from the native app");
            },
        });

        linker.openURL(url);
    }

    function linkAddressToBrightID() {
        // window.open(qrCodeUrl);

        var url = qrCodeUrl;

        if (url === "") {
            return;
        }

        var linker = new DeepLinker({
            onIgnored: function () {
                console.log("browser failed to respond to the deep link");

                setLinkAddressToBrightIDError(
                    "Couldn't open BrightID. Scan the QR code below with the device you have BrightID installed on."
                );
            },
            onFallback: function () {
                console.log("dialog hidden or user returned to tab");
            },
            onReturn: function () {
                console.log("user returned to the page from the native app");
            },
        });

        linker.openURL(url);
    }

    function reconnectWallet() {
        if (registration.hasReconnectableWallet()) {
            connectWallet();
        }
    }

    async function connectWallet() {
        try {
            removeEvents();

            await registration.connectWallet();

            addEvents();
            onAccountChange();
            setStepConnecWalletError("");
        } catch (e) {
            // console.error(e);
            // console.log(e);

            setStepConnecWalletError(e.message);
        }
    }

    async function chooseWallet() {
        try {
            removeEvents();

            await registration.chooseWallet();

            addEvents();
            onAccountChange();
            setStepConnecWalletError("");
        } catch (e) {
            // console.error(e);
            // console.log(e);

            setStepConnecWalletError(e.message);
        }
    }

    async function faucetClaim() {
        try {
            setStepObtainGasTokensStatus(
                "We're obtaining your gas tokens. This can take up to a minute. Please wait."
            );

            const response = await registration.faucetClaim();

            if (response.ok === false) {
                throw new Error(`HTTP error, status = ${response.status}`);
            }

            setStepObtainGasTokensError("");
        } catch (e) {
            // console.error(e);
            // console.log(e);

            setStepObtainGasTokensError(e.message);
            setStepObtainGasTokensStatus("");
        }
    }

    async function switchToIDChainNetwork() {
        try {
            await registration.switchToIDChainNetwork();

            setStepSwitchToIDChainNetworkError("");
        } catch (switchError) {
            // console.log(switchError);

            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                addIDChainNetwork();

                return;
            }

            // console.error(switchError);
            // console.log(switchError);

            setStepSwitchToIDChainNetworkError(switchError.message);
        }
    }

    async function switchToMainnetNetwork() {
        try {
            await registration.switchToMainnetNetwork();
        } catch (switchError) {
            // console.error(switchError);
            // console.log(switchError);
        }
    }

    async function addIDChainNetwork() {
        try {
            await registration.addIDChainNetwork();

            setStepSwitchToIDChainNetworkError("");
        } catch (addError) {
            // console.error(addError);
            // console.log(addError);

            setStepSwitchToIDChainNetworkError(addError.message);
        }
    }

    async function sponsorViaContract() {
        try {
            const tx = await registration.sponsorViaContract();

            setIsSponsoredViaContractTxnProcessing(true);
            setIsSponsoredViaContractTxnId(tx.hash);
            setStepSponsoredViaContractError("");

            // wait for the transaction to be mined
            await tx.wait();
            // const receipt = await tx.wait();
            // // console.log(receipt);

            await initIsSponsoredViaContract();

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
            const tx = await registration.verifyViaContract();

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

    /* Step State Checks */
    /* ---------------------------------------------------------------------- */

    function hasConnectedWallet() {
        return walletAddress !== "";
    }

    function hasBrightIDIdchainLinked() {
        return isBrightIDIdchainLinked === true;
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
        return gasBalance > 0;
    }

    /* Step Completion Flags */
    /* ---------------------------------------------------------------------- */

    function getStepCompleteString(status) {
        return status === true ? "complete" : "incomplete";
    }

    function stepConnecWalletComplete() {
        return hasConnectedWallet();
    }

    function stepBrightIDLinkedIdchainComplete() {
        return hasBrightIDIdchainLinked();
    }

    function stepBrightIDLinkedComplete() {
        return hasBrightIDLinked();
    }

    function stepSwitchToIDChainNetworkComplete() {
        return hasSwitchedToIDChainNetwork();
    }

    function stepObtainGasTokensComplete() {
        return hasObtainedGasTokens();
    }

    function stepSponsoredViaContractComplete() {
        return hasSponsoredViaContract();
    }

    function stepVerifyViaContractComplete() {
        return hasVerifiedViaContract();
    }

    /* Step Active Flags */
    /* ---------------------------------------------------------------------- */

    function getStepActiveString(status) {
        return status === true ? "active" : "inactive";
    }

    function stepConnecWalletActive() {
        return true;
    }

    function stepBrightIDLinkedIdchainActive() {
        return stepConnecWalletComplete() && stepConnecWalletActive();
    }

    function stepBrightIDLinkedActive() {
        return (
            stepBrightIDLinkedIdchainComplete() &&
            stepBrightIDLinkedIdchainActive()
        );
    }

    function stepSwitchToIDChainNetworkActive() {
        return stepBrightIDLinkedComplete() && stepBrightIDLinkedActive();
    }

    function stepObtainGasTokensActive() {
        return (
            stepSwitchToIDChainNetworkComplete() &&
            stepSwitchToIDChainNetworkActive()
        );
    }

    function stepSponsoredViaContractActive() {
        return stepObtainGasTokensComplete() && stepObtainGasTokensActive();
    }

    function stepVerifyViaContractActive() {
        return (
            stepSponsoredViaContractComplete() &&
            stepSponsoredViaContractActive()
        );
    }

    /* Bootstrap */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        if (firstUpdate.current === false) {
            return;
        }

        if (firstUpdate.current) {
            firstUpdate.current = false;
        }

        // Initialize registration class.
        registration = new IdchainRegistrationModel(props);

        // Reconnect on Load
        reconnectWallet();
    });

    /* Template */
    /* ---------------------------------------------------------------------- */

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
                        idchain-registration-step--connect
                        idchain-registration-step--${getStepCompleteString(
                            stepConnecWalletComplete()
                        )}
                        idchain-registration-step--${getStepActiveString(
                            stepConnecWalletActive()
                        )}
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
                        {ensName && (
                            <p className="idchain-registration-step__description-p">
                                <strong>ENS: </strong>
                                <span className="idchain-registration-step__description-ens-address">
                                    {ensName}
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
                        {stepConnecWalletError && (
                            <div className="idchain-registration-step__response idchain-registration-step__response--error">
                                {stepConnecWalletError}
                            </div>
                        )}
                    </div>
                </section>
                <section
                    className={`
                        idchain-registration-step
                        idchain-registration-step--brightid-link-idchain
                        idchain-registration-step--${getStepCompleteString(
                            stepBrightIDLinkedIdchainComplete()
                        )}
                        idchain-registration-step--${getStepActiveString(
                            stepBrightIDLinkedIdchainActive()
                        )}
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
                    {qrCodeIdchainUrl && (
                        <div
                            className="
                            idchain-registration-step__description
                            idchain-registration-step__description--action
                            idchain-registration-step__description--action-hide-on-complete
                        "
                        >
                            <div className="idchain-registration-step--mobile">
                                <p className="idchain-registration-step__description-p ">
                                    If you're on the device with BrightID
                                    installed use this button to open BrightID
                                    and link your wallet.
                                </p>
                                <p className="idchain-registration-step__description-button-container">
                                    <button
                                        className="idchain-registration-step__button"
                                        onClick={() =>
                                            linkAddressToBrightIDIdchain()
                                        }
                                    >
                                        Link Address
                                    </button>
                                </p>
                                <div className="idchain-registration-step__feedback">
                                    {linkAddressToBrightIDIdchainError && (
                                        <div className="idchain-registration-step__response idchain-registration-step__response--error">
                                            {linkAddressToBrightIDIdchainError}
                                        </div>
                                    )}
                                </div>
                                <p className="idchain-registration-step--mobile">
                                    <br />
                                </p>
                                <p className="idchain-registration-step__description-p">
                                    If BrightID is installed on another device
                                    scan the QR code below with the "Scan a
                                    Code" button in the BrightID mobile app.
                                </p>
                            </div>
                            <div className="idchain-registration-step--desktop">
                                <p className="idchain-registration-step__description-p">
                                    Use the "Scan a Code" button in the BrightID
                                    app to scan the QR code below.
                                </p>
                            </div>
                            <p className="idchain-registration-step__description-qrcode-container">
                                <QRCode
                                    renderAs="svg"
                                    size={200}
                                    value={qrCodeIdchainUrl}
                                />
                            </p>
                            <div className="idchain-registration-step--desktop">
                                <p className="idchain-registration-step__description-p">
                                    After linking, you'll get a confirmation in
                                    the BrightID app. Then just wait a few
                                    seconds and this website will update to
                                    allow continuing to the next step.
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="idchain-registration-step__feedback"></div>
                </section>
                <section
                    className={`
                        idchain-registration-step
                        idchain-registration-step--brightid-link
                        idchain-registration-step--${getStepCompleteString(
                            stepBrightIDLinkedComplete()
                        )}
                        idchain-registration-step--${getStepActiveString(
                            stepBrightIDLinkedActive()
                        )}
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
                    {qrCodeUrl && (
                        <div
                            className="
                            idchain-registration-step__description
                            idchain-registration-step__description--action
                            idchain-registration-step__description--action-hide-on-complete
                        "
                        >
                            <div className="idchain-registration-step--mobile">
                                <p className="idchain-registration-step__description-p">
                                    If you're on your mobile device just use
                                    this button to open BrightID and link your
                                    wallet.
                                </p>
                                <p className="idchain-registration-step__description-button-container">
                                    <button
                                        className="idchain-registration-step__button"
                                        onClick={() => linkAddressToBrightID()}
                                    >
                                        Link Address
                                    </button>
                                </p>
                                <div className="idchain-registration-step__feedback">
                                    {linkAddressToBrightIDError && (
                                        <div className="idchain-registration-step__response idchain-registration-step__response--error">
                                            {linkAddressToBrightIDError}
                                        </div>
                                    )}
                                </div>
                                <p className="idchain-registration-step--mobile">
                                    <br />
                                </p>
                                <p className="idchain-registration-step__description-p">
                                    If BrightID is installed on another device
                                    scan the QR code below with the "Scan a
                                    Code" button in the BrightID mobile app.
                                </p>
                            </div>
                            <div className="idchain-registration-step--desktop">
                                <p className="idchain-registration-step__description-p">
                                    Use the "Scan a Code" button in the BrightID
                                    app to scan the QR code below.
                                </p>
                            </div>
                            <p className="idchain-registration-step__description-qrcode-container">
                                <QRCode
                                    renderAs="svg"
                                    size={200}
                                    value={qrCodeUrl}
                                />
                            </p>
                            <div className="idchain-registration-step--desktop">
                                <p className="idchain-registration-step__description-p">
                                    After linking, you'll get a confirmation in
                                    the BrightID app. Then just wait a few
                                    seconds and this website will update to
                                    allow continuing to the next step.
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="idchain-registration-step__feedback"></div>
                </section>
                <section
                    className={`
                        idchain-registration-step
                        idchain-registration-step--${getStepCompleteString(
                            stepSwitchToIDChainNetworkComplete()
                        )}
                        idchain-registration-step--${getStepActiveString(
                            stepSwitchToIDChainNetworkActive()
                        )}
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
                            {canAutoSwitchNetworks && (
                                <button
                                    className="idchain-registration-step__button"
                                    onClick={() => switchToIDChainNetwork()}
                                >
                                    Switch
                                </button>
                            )}
                        </div>
                    </div>
                    {!canAutoSwitchNetworks && (
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
                        idchain-registration-step--${getStepCompleteString(
                            stepObtainGasTokensComplete()
                        )}
                        idchain-registration-step--${getStepActiveString(
                            stepObtainGasTokensActive()
                        )}
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
                        {stepObtainGasTokensStatus && (
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
                                    <div>{stepObtainGasTokensStatus}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
                <section
                    className={`
                        idchain-registration-step
                        idchain-registration-step--${getStepCompleteString(
                            stepSponsoredViaContractComplete()
                        )}
                        idchain-registration-step--${getStepActiveString(
                            stepSponsoredViaContractActive()
                        )}
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
                            {stepSwitchToIDChainNetworkComplete() && (
                                <button
                                    className="idchain-registration-step__button"
                                    onClick={() => sponsorViaContract()}
                                    disabled={!hasSwitchedToIDChainNetwork()}
                                >
                                    Go
                                </button>
                            )}
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
                        idchain-registration-step--${getStepCompleteString(
                            stepVerifyViaContractComplete()
                        )}
                        idchain-registration-step--${getStepActiveString(
                            stepVerifyViaContractActive()
                        )}
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
                            {stepSwitchToIDChainNetworkComplete() && (
                                <button
                                    className="idchain-registration-step__button"
                                    onClick={() => verifyViaContract()}
                                >
                                    Verify
                                </button>
                            )}
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
                        {stepVerifyViaContractComplete() && (
                            <div className="idchain-registration-step__description">
                                <p className="idchain-registration-step__description-p">
                                    <strong>
                                        That's a wrap. You're ready to go.
                                    </strong>
                                </p>
                                <p className="idchain-registration-step__description-p">
                                    Before you leave you can use the button
                                    below to switch your wallet back to the
                                    Ethereum mainnet.
                                </p>
                                {canAutoSwitchNetworks && (
                                    <p className="idchain-registration-step__description-p">
                                        <button
                                            className="idchain-registration-step__button"
                                            onClick={() =>
                                                switchToMainnetNetwork()
                                            }
                                        >
                                            Switch back to Mainnet
                                        </button>
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default IdchainRegistration;
