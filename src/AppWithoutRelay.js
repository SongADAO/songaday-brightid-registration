import logo from "./logo.png";
import "./App.css";
// import { BrightIDRegistration } from "./components/react-brightid-registration/src";
import { BrightIDRegistration } from "react-brightid-registration";

function AppWithoutRelay() {
    return (
        <div className="App">
            <header className="App-header">
                <img
                    className="App-header__image"
                    src={logo}
                    alt="Song a Day"
                />
            </header>
            <main>
                <div className="App-brightid-registration">
                    <BrightIDRegistration
                        appStoreAndroid="https://play.google.com/store/apps/details?id=org.brightid"
                        appStoreIos="https://apps.apple.com/us/app/brightid/id1428946820"
                        brightIdMeetUrl="https://meet.brightid.org"
                        context="snapshot"
                        contractAddr="0x81591DC4997A76A870c13D383F8491B288E09344"
                        // contractAddr="0x62b008b2593a175BB33FFFbe8a11a92939B5A67C"
                        deepLinkPrefix="brightid://link-verification/http:%2f%2fnode.brightid.org"
                        faucetClaimURL="https://idchain.one/begin/api/claim"
                        mainnetRpcUrl="https://mainnet.infura.io/v3/60a7b2c16321439a917c9e74a994f7df"
                        walletConnectInfuraId="60a7b2c16321439a917c9e74a994f7df"
                        registrationBlockExplorerUrl="https://explorer.idchain.one"
                        registrationBlockExplorerTxnPath="/tx/"
                        registrationChainId="74"
                        registrationChainName="IDChain"
                        registrationIconUrl="https://apps.brightid.org/logos/idchain.png"
                        registrationRpcUrl="https://idchain.one/rpc/"
                        registrationTokenDecimal="18"
                        registrationTokenName="Eidi"
                        verificationUrl="https://app.brightid.org/node/v5/verifications"
                    />
                </div>
            </main>
            <footer className="App-footer">
                &copy; 2022{" "}
                <a
                    href="https://songaday.world/"
                    target="_blank"
                    rel="noreferrer"
                >
                    SongADAO LCA
                </a>
            </footer>
        </div>
    );
}

export default AppWithoutRelay;
