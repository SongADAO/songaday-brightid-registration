import googlePlay from "./google-play.png";
import appStore from "./app-store.png";
import openAchievementsSS from "./open-achievements-ss.png";
import isVerifiedSS from "./is-verified-ss.png";
import "./BrightIDRegistration.css";
import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode.react";
import BrightIDRegistrationModel from "./BrightIDRegistrationModel";
import DeepLinker from "./DeepLinker";

let registration;

let changePollingInterval = 0;

function BrightIDRegistrationViaRelay(props) {
    /* State */
    /* ---------------------------------------------------------------------- */

    const firstUpdate = useRef(true);

    const [walletAddress, setWalletAddress] = useState("");

    const [ensName, setENSName] = useState("");

    const [qrCodeUrl, setQrCodeUrl] = useState("");

    const [isBrightIDLinked, setIsBrightIDLinked] = useState(false);

    const [isVerifiedViaContract, setIsVerifiedViaContract] = useState(false);

    const [stepConnectWalletError, setStepConnectWalletError] = useState("");

    const [stepVerifyViaContractStatus, setStepVerifyViaContractStatus] =
        useState("");

    const [stepVerifyViaContractError, setStepVerifyViaContractError] =
        useState("");

    const [linkAddressToBrightIDError, setLinkAddressToBrightIDError] =
        useState("");

    /* Web3 Data Init & Monitoring */
    /* ---------------------------------------------------------------------- */

    async function onAccountDisconnect() {
        resetWalletData();
        setWalletAddress("");
        setENSName("");
        setQrCodeUrl("");
        setIsBrightIDLinked("");
        setIsVerifiedViaContract("");
    }

    async function onAccountChange() {
        resetWalletData();
        initWalletAddress();
        initENSName();
        initQrCodeUrl();
        initIsBrightIDLinked();
        initIsVerifiedViaContract();
    }

    function onChangePolling() {
        if (registration.isBrightIDLinked === false) {
            initIsBrightIDLinked();
        }

        if (registration.isVerifiedViaContract === false) {
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
        }

        if (changePollingInterval) {
            clearInterval(changePollingInterval);
        }
    }

    function addEvents() {
        console.log("add events");

        if (typeof registration.web3Instance === "object") {
            registration.web3Instance.on("accountsChanged", onAccountChange);
        }

        changePollingInterval = setInterval(onChangePolling, 5000);
    }

    /* State Data Query */
    /* ---------------------------------------------------------------------- */

    async function resetWalletData() {
        try {
            await registration.resetWalletData();
        } catch (e) {
            // console.error(e);
            // console.log(e);
        }
    }

    async function initWalletAddress() {
        try {
            const walletAddress = await registration.initWalletAddress();

            setWalletAddress(walletAddress);
            setStepConnectWalletError("");
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

    async function initQrCodeUrl() {
        try {
            const qrCodeUrl = await registration.getQrCodeUrl();

            setQrCodeUrl(qrCodeUrl);
        } catch (e) {
            // console.error(e);
            // console.log(e);
        }
    }

    async function initIsBrightIDLinked() {
        try {
            const isBrightIDLinked = await registration.initIsBrightIDLinked();

            setIsBrightIDLinked(isBrightIDLinked);
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

    async function initRegistration() {
        if (typeof registration === "object") {
            return;
        }

        console.log("initRegistration");

        // Initialize registration class.
        registration = new BrightIDRegistrationModel(props);
    }

    async function reconnectWallet() {
        await initRegistration();

        if (registration.hasReconnectableWallet()) {
            connectWallet();
        }
    }

    async function connectWallet() {
        try {
            setStepConnectWalletError("");
            await initRegistration();
            removeEvents();
            await registration.connectWallet();
            addEvents();
            onAccountChange();
        } catch (e) {
            // console.error(e);
            // console.log(e);

            onAccountDisconnect();

            if (e.message === "User Rejected") {
                setStepConnectWalletError("Unlock your wallet to continue");
            } else {
                setStepConnectWalletError(e.message);
            }
        }
    }

    async function chooseWallet() {
        try {
            setStepConnectWalletError("");
            await initRegistration();
            removeEvents();
            await registration.chooseWallet();
            addEvents();
            onAccountChange();
        } catch (e) {
            // console.error(e);
            // console.log(e);

            onAccountDisconnect();

            if (e.message === "User Rejected") {
                setStepConnectWalletError("Unlock your wallet to continue");
            } else {
                setStepConnectWalletError(e.message);
            }
        }
    }

    async function verifyViaContract() {
        try {
            setStepVerifyViaContractStatus(
                "We're registering your BrightID account with Snapshot.  This can take up to a minute. Please wait."
            );

            const response = await registration.verifyViaRelay();

            if (response.ok === false) {
                const body = await response.json();

                throw new Error(body.errorMessage);
            }

            await initIsVerifiedViaContract();

            setStepVerifyViaContractError("");
            setStepVerifyViaContractStatus("");
        } catch (e) {
            // console.error(e);
            // console.log(e);

            await initIsVerifiedViaContract();

            setStepVerifyViaContractError(e.message);
            setStepVerifyViaContractStatus("");
        }
    }

    /* Step State Checks */
    /* ---------------------------------------------------------------------- */

    function hasConnectedWallet() {
        return walletAddress !== "";
    }

    function hasBrightIDLinked() {
        return isBrightIDLinked === true;
    }

    function hasVerifiedViaContract() {
        return isVerifiedViaContract === true;
    }

    /* Step Completion Flags */
    /* ---------------------------------------------------------------------- */

    function getStepCompleteString(status) {
        return status === true ? "complete" : "incomplete";
    }

    function stepConnectWalletComplete() {
        return hasConnectedWallet();
    }

    function stepBrightIDLinkedComplete() {
        return hasBrightIDLinked();
    }

    function stepVerifyViaContractComplete() {
        return hasVerifiedViaContract();
    }

    /* Step Active Flags */
    /* ---------------------------------------------------------------------- */

    function getStepActiveString(status) {
        return status === true ? "active" : "inactive";
    }

    function stepConnectWalletActive() {
        return true;
    }

    function stepBrightIDLinkedActive() {
        return stepConnectWalletComplete() && stepConnectWalletActive();
    }

    function stepVerifyViaContractActive() {
        return stepBrightIDLinkedComplete() && stepBrightIDLinkedActive();
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

        // Reconnect on Load
        reconnectWallet();
    });

    /* Template */
    /* ---------------------------------------------------------------------- */

    return (
        <div className="brightid-registration">
            <div>
                <section className={`brightid-registration-step`}>
                    <div className="brightid-registration-step__main">
                        <div className="brightid-registration-step__header">
                            <h2 className="brightid-registration-step__heading">
                                Install BrightID
                            </h2>
                        </div>
                        <div className="brightid-registration-step__action brightid-registration-step__action--app-store">
                            <div>
                                <a
                                    href={props.appStoreAndroid}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                >
                                    <img
                                        className="brightid-registration-step__app-store-image"
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
                                        className="brightid-registration-step__app-store-image"
                                        src={appStore}
                                        alt="Download on App Store"
                                    />
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="brightid-registration-step__description">
                        <p className="brightid-registration-step__description-p">
                            The first step is to install the BrightID app on
                            your mobile device.
                        </p>
                    </div>
                </section>
                <section className={`brightid-registration-step`}>
                    <div className="brightid-registration-step__main">
                        <div className="brightid-registration-step__header">
                            <h2 className="brightid-registration-step__heading">
                                Verify with BrightID
                            </h2>
                        </div>
                        <div className="brightid-registration-step__action">
                            {/* <button
                                className="brightid-registration-step__button"
                                onClick={() => verifyWithBrightID()}
                            >
                                Get Verified
                            </button> */}
                        </div>
                    </div>
                    <div className="brightid-registration-step__description">
                        <p className="brightid-registration-step__description-p">
                            Once you have BrightID installed you need to become
                            verified in their system by participating in a
                            "Verification Party".
                        </p>
                        <p className="brightid-registration-step__description-button-container">
                            <button
                                className="brightid-registration-step__button"
                                onClick={() => verifyWithBrightID()}
                            >
                                Find Verification Party
                            </button>
                        </p>
                        <h3 className="brightid-registration-step__description-p">
                            Support
                        </h3>
                        <p className="brightid-registration-step__description-p">
                            More details on becoming verified within the
                            BrightID system can be found at{" "}
                            <a
                                className="brightid-registration-step__description-link"
                                href="https://brightid.gitbook.io/brightid/getting-verified"
                                target="_blank"
                                rel="noreferrer"
                            >
                                How To Verify
                            </a>
                            .
                        </p>
                        <p className="brightid-registration-step__description-p">
                            They also have a{" "}
                            <a
                                className="brightid-registration-step__description-link"
                                href="https://discord.gg/xzhFEeK"
                                target="_blank"
                                rel="noreferrer"
                            >
                                Discord channel
                            </a>{" "}
                            for support.
                        </p>
                        <h3 className="brightid-registration-step__description-p">
                            After Verification
                        </h3>
                        <p className="brightid-registration-step__description-p">
                            After you have verified via a connection party, it
                            will take up to 10 minutes for you to become
                            verified in their system. You will know when you're
                            ready to continue through the rest of steps in this
                            process when you see "BrightID meet" checked off in
                            your list of achievements. See the screenshots below
                            for where to look in the app.
                        </p>

                        <p className="brightid-registration-step__description-p brightid-registration-step__description-p--2col-img">
                            <img
                                className="brightid-registration-step__app-store-image"
                                src={openAchievementsSS}
                                alt="Open Achievements"
                            />
                            <img
                                className="brightid-registration-step__app-store-image"
                                src={isVerifiedSS}
                                alt="Check Is Verified"
                            />
                        </p>
                    </div>
                </section>
                <section
                    className={`
                        brightid-registration-step
                        brightid-registration-step--connect
                        brightid-registration-step--${getStepCompleteString(
                            stepConnectWalletComplete()
                        )}
                        brightid-registration-step--${getStepActiveString(
                            stepConnectWalletActive()
                        )}
                    `}
                >
                    <div className="brightid-registration-step__main">
                        <div className="brightid-registration-step__status">
                            <div className="brightid-registration-step__status-icon"></div>
                        </div>
                        <div className="brightid-registration-step__header">
                            <h2 className="brightid-registration-step__heading">
                                Connect Wallet
                            </h2>
                        </div>
                        <div className="brightid-registration-step__action">
                            <button
                                className="brightid-registration-step__button"
                                onClick={() => chooseWallet()}
                            >
                                Connect
                            </button>
                        </div>
                    </div>
                    <div className="brightid-registration-step__description">
                        {ensName && (
                            <p className="brightid-registration-step__description-p">
                                <strong>ENS: </strong>
                                <span className="brightid-registration-step__description-ens-address">
                                    {ensName}
                                </span>
                            </p>
                        )}
                        {walletAddress && (
                            <p className="brightid-registration-step__description-p">
                                <strong>Address: </strong>
                                <span className="brightid-registration-step__description-wallet-address">
                                    {walletAddress}
                                </span>
                            </p>
                        )}
                        {!walletAddress && (
                            <p className="brightid-registration-step__description-p">
                                <strong>Address: </strong>
                                <span>Not Connected</span>
                            </p>
                        )}
                    </div>
                    <div className="brightid-registration-step__feedback">
                        {stepConnectWalletError && (
                            <div className="brightid-registration-step__response brightid-registration-step__response--error">
                                {stepConnectWalletError}
                            </div>
                        )}
                    </div>
                </section>
                <section
                    className={`
                        brightid-registration-step
                        brightid-registration-step--brightid-link
                        brightid-registration-step--${getStepCompleteString(
                            stepBrightIDLinkedComplete()
                        )}
                        brightid-registration-step--${getStepActiveString(
                            stepBrightIDLinkedActive()
                        )}
                    `}
                >
                    <div className="brightid-registration-step__main">
                        <div className="brightid-registration-step__status">
                            <div className="brightid-registration-step__status-icon"></div>
                        </div>
                        <div className="brightid-registration-step__header">
                            <h2 className="brightid-registration-step__heading">
                                Link Wallet to BrightID
                            </h2>
                        </div>
                        <div className="brightid-registration-step__action">
                            {/* <button
                                className="brightid-registration-step__button"
                                onClick={() => linkAddressToBrightID()}
                            >
                                Link Address
                            </button> */}
                        </div>
                    </div>
                    {qrCodeUrl && (
                        <div
                            className="
                            brightid-registration-step__description
                            brightid-registration-step__description--action
                            brightid-registration-step__description--action-hide-on-complete
                        "
                        >
                            <div className="brightid-registration-step--mobile">
                                <p className="brightid-registration-step__description-p">
                                    If you're on your mobile device just use
                                    this button to open BrightID and link your
                                    wallet.
                                </p>
                                <p className="brightid-registration-step__description-button-container">
                                    <button
                                        className="brightid-registration-step__button"
                                        onClick={() => linkAddressToBrightID()}
                                    >
                                        Link Address
                                    </button>
                                </p>
                                <div className="brightid-registration-step__feedback">
                                    {linkAddressToBrightIDError && (
                                        <div className="brightid-registration-step__response brightid-registration-step__response--error">
                                            {linkAddressToBrightIDError}
                                        </div>
                                    )}
                                </div>
                                <p className="brightid-registration-step--mobile">
                                    <br />
                                </p>
                                <p className="brightid-registration-step__description-p">
                                    If BrightID is installed on another device
                                    scan the QR code below with the "Scan a
                                    Code" button in the BrightID mobile app.
                                </p>
                            </div>
                            <div className="brightid-registration-step--desktop">
                                <p className="brightid-registration-step__description-p">
                                    Use the "Scan a Code" button in the BrightID
                                    app to scan the QR code below.
                                </p>
                            </div>
                            <p className="brightid-registration-step__description-qrcode-container">
                                <QRCode
                                    renderAs="svg"
                                    size={200}
                                    value={qrCodeUrl}
                                />
                            </p>
                            <div className="brightid-registration-step--desktop">
                                <p className="brightid-registration-step__description-p">
                                    After linking, you'll get a confirmation in
                                    the BrightID app. Then just wait a few
                                    seconds and this website will update to
                                    allow continuing to the next step.
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="brightid-registration-step__feedback"></div>
                </section>
                <section
                    className={`
                        brightid-registration-step
                        brightid-registration-step--${getStepCompleteString(
                            stepVerifyViaContractComplete()
                        )}
                        brightid-registration-step--${getStepActiveString(
                            stepVerifyViaContractActive()
                        )}
                    `}
                >
                    <div className="brightid-registration-step__main">
                        <div className="brightid-registration-step__status">
                            <div className="brightid-registration-step__status-icon"></div>
                        </div>
                        <div className="brightid-registration-step__header">
                            <h2 className="brightid-registration-step__heading">
                                Register Wallet with Snapshot
                            </h2>
                        </div>
                        <div className="brightid-registration-step__action">
                            {stepConnectWalletComplete() &&
                                stepBrightIDLinkedComplete() && (
                                    <button
                                        className="brightid-registration-step__button"
                                        onClick={() => verifyViaContract()}
                                    >
                                        Register
                                    </button>
                                )}
                        </div>
                    </div>
                    <div className="brightid-registration-step__feedback">
                        {stepVerifyViaContractStatus && (
                            <div className="brightid-registration-step__response">
                                <div className="brightid-registration-step__response-loading-icon">
                                    <div className="brightid-registration-step__loading-icon">
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                        <div></div>
                                    </div>
                                </div>
                                <div className="brightid-registration-step__response-message">
                                    <div>{stepVerifyViaContractStatus}</div>
                                </div>
                            </div>
                        )}
                        {stepVerifyViaContractError && (
                            <div className="brightid-registration-step__response brightid-registration-step__response--error">
                                {stepVerifyViaContractError}
                            </div>
                        )}
                        {stepVerifyViaContractComplete() && (
                            <div className="brightid-registration-step__description">
                                <p className="brightid-registration-step__description-p">
                                    <strong>
                                        You're registered and ready to vote.
                                    </strong>
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default BrightIDRegistrationViaRelay;
