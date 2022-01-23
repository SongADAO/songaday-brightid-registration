// import logo from "./logo.svg";
import "./App.css";
import IdchainRegistration from "./IdchainRegistration";

function App() {
    return (
        <div className="App">
            <div className="App-idchain-registration">
                <IdchainRegistration
                    appStoreAndroid="https://play.google.com/store/apps/details?id=org.brightid"
                    appStoreIos="https://apps.apple.com/us/app/brightid/id1428946820"
                    brightIdMeetUrl="https://meet.brightid.org"
                    context="snapshot"
                    contractAddr="0x81591DC4997A76A870c13D383F8491B288E09344"
                    deepLinkPrefix="brightid://link-verification/http:%2f%2fnode.brightid.org"
                    faucetClaimURL="https://idchain.one/api/claim"
                    mainnetRpcUrl="https://mainnet.infura.io/v3/fa20524651b3467098dbdca487a2e765"
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
        </div>
    );
}

export default App;
