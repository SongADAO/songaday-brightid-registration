import { ethers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

class IdchainRegistrationModel {
    props;

    contractAbi = [
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

    web3Modal;

    web3Instance;

    walletAddress = "";

    ensName = "";

    chainId = 0;

    gasBalance = 0.0;

    isBrightIDIdchainLinked = false;

    isBrightIDLinked = false;

    isSponsoredViaContract = false;

    isVerifiedViaContract = false;

    constructor(props) {
        this.props = props;
    }

    resetWalletData() {
        this.walletAddress = "";
        this.ensName = "";
        this.chainId = 0;
        this.gasBalance = 0.0;
        this.isBrightIDIdchainLinked = false;
        this.isBrightIDLinked = false;
        this.isSponsoredViaContract = false;
        this.isVerifiedViaContract = false;
    }

    /* Web3 Modal & Instances */
    /* ---------------------------------------------------------------------- */

    async getWeb3Modal() {
        if (typeof this.web3Modal === "object") {
            return this.web3Modal;
        }

        console.log("init Web3Modal");

        const providerOptions = {
            walletconnect: {
                package: WalletConnectProvider,
                options: {
                    infuraId: this.props.walletConnectInfuraId, // required
                    rpc: {},
                    // network: this.props.registrationChainName,
                },
            },
        };

        providerOptions.walletconnect.options.rpc[
            this.props.registrationChainId
        ] = this.props.registrationRpcUrl;

        this.web3Modal = new Web3Modal({
            network: "mainnet", // optional
            cacheProvider: true, // optional
            providerOptions, // required
        });

        return this.web3Modal;
    }

    async getInstance() {
        if (typeof this.web3Instance === "object") {
            return this.web3Instance;
        }

        const web3Modal = await this.getWeb3Modal();

        const newInstance = await web3Modal.connect();

        this.web3Instance = newInstance;

        return this.web3Instance;
    }

    async getFreshInstance() {
        const web3Modal = await this.getWeb3Modal();

        await web3Modal.clearCachedProvider();

        const newInstance = await web3Modal.connect();

        this.web3Instance = newInstance;

        return this.web3Instance;
    }

    /* Providers */
    /* ---------------------------------------------------------------------- */

    async getProvider() {
        const instance = await this.getInstance();

        return new ethers.providers.Web3Provider(instance);
    }

    getMainnetProvider() {
        return new ethers.providers.JsonRpcProvider(this.props.mainnetRpcUrl);
    }

    getIdchainProvider() {
        return new ethers.providers.JsonRpcProvider(
            this.props.registrationRpcUrl
        );
    }

    /* Contracts */
    /* ---------------------------------------------------------------------- */

    async getIdchainProviderContract() {
        const provider = await this.getIdchainProvider();

        return new ethers.Contract(
            this.props.contractAddr,
            this.contractAbi,
            provider
        );
    }

    async getContract() {
        const provider = await this.getProvider();

        return new ethers.Contract(
            this.props.contractAddr,
            this.contractAbi,
            provider
        );
    }

    async getContractRw() {
        const provider = await this.getProvider();

        return new ethers.Contract(
            this.props.contractAddr,
            this.contractAbi,
            provider.getSigner()
        );
    }

    /* Provider Feature Detection */
    /* ---------------------------------------------------------------------- */

    getProviderType() {
        return JSON.parse(localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER"));
    }

    canAutoSwitchNetworks() {
        return this.getProviderType() !== "walletconnect";
    }

    hasReconnectableWallet() {
        return (
            this.getProviderType() === "injected" ||
            this.getProviderType() === "walletconnect"
        );
    }

    /* Data Query */
    /* ---------------------------------------------------------------------- */

    async getWalletAddress() {
        if (
            typeof this.walletAddress === "string" &&
            this.walletAddress !== ""
        ) {
            return this.walletAddress;
        }

        this.walletAddress = await this.queryWalletAddress();

        return this.walletAddress;
    }

    async getQrCodeUrl() {
        const addr = await this.getWalletAddress();

        return `${this.props.deepLinkPrefix}/${this.props.context}/${addr}`;
    }

    async getQrCodeIdchainUrl() {
        const addr = await this.getWalletAddress();

        return `${this.props.deepLinkPrefix}/idchain/${addr}`;
    }

    async queryWalletAddress() {
        try {
            console.log("queryWalletAddress");

            const provider = await this.getProvider();

            const accounts = await provider.listAccounts();

            if (accounts.length === 0) {
                throw new Error("No WalAddress Found");
            }

            return accounts[0];
        } catch (e) {
            // console.error(e);
            // console.log(e);

            return "";
        }
    }

    async queryENSName() {
        try {
            console.log("queryENSName");

            const addr = await this.getWalletAddress();

            const provider = this.getMainnetProvider();

            const name = await provider.lookupAddress(addr);

            // console.log(name);

            return name;
        } catch (e) {
            // console.error(e);
            // console.log(e);

            return "";
        }
    }

    async queryChainId() {
        try {
            console.log("queryChainId");

            const provider = await this.getProvider();

            const { chainId } = await provider.getNetwork();

            return chainId;
        } catch (e) {
            // console.error(e);
            // console.log(e);

            return 0;
        }
    }

    async queryGasBalance() {
        try {
            console.log("checkGas");

            const addr = await this.getWalletAddress();

            const provider = await this.getIdchainProvider();

            const balanceRaw = await provider.getBalance(addr);

            const balanceFormatted = await ethers.utils.formatEther(balanceRaw);

            return parseFloat(balanceFormatted);
        } catch (e) {
            // console.error(e);
            // console.log(e);

            return 0.0;
        }
    }

    async queryBrightIDIdchainLink(contextId) {
        try {
            console.log("queryBrightIDIdchainLink");

            const userVerificationUrl = `${this.props.verificationUrl}/idchain/${contextId}?signed=null&timestamp=null`;

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

    async queryBrightIDLink(contextId) {
        try {
            console.log("queryBrightIDLink");

            const userVerificationUrl = `${this.props.verificationUrl}/${this.props.context}/${contextId}?signed=null&timestamp=null`;

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

    async queryBrightIDSponsorship(contextId) {
        try {
            console.log("queryBrightIDSponsorship");

            const userVerificationUrl = `${this.props.verificationUrl}/${this.props.context}/${contextId}?signed=eth&timestamp=seconds`;

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

    async queryBrightIDVerification(contextId) {
        try {
            console.log("queryBrightIDVerification");

            const addr = await this.getWalletAddress();

            const contract = await this.getIdchainProviderContract();

            const isVerified = await contract.isVerifiedUser(addr);

            // console.log(isVerified);

            return isVerified;
        } catch (e) {
            // console.error(e);
            // console.log(e);

            return false;
        }
    }

    async queryBrightIDSignature(contextId) {
        try {
            const userVerificationUrl = `${this.props.verificationUrl}/${this.props.context}/${contextId}?signed=eth&timestamp=seconds`;

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

    /* State Data Query */
    /* ---------------------------------------------------------------------- */

    async initWalletAddress() {
        try {
            this.walletAddress = await this.queryWalletAddress();

            return this.walletAddress;
        } catch (e) {
            // console.error(e);
            // console.log(e);
        }
    }

    async initENSName() {
        try {
            this.ensName = await this.queryENSName();

            return this.ensName;
        } catch (e) {
            // console.error(e);
            // console.log(e);
        }
    }

    async initChainId() {
        try {
            this.chainId = await this.queryChainId();

            return this.chainId;
        } catch (e) {
            // console.error(e);
            // console.log(e);
        }
    }

    async initGasBalance() {
        try {
            this.gasBalance = await this.queryGasBalance();

            return this.gasBalance;
        } catch (e) {
            // console.error(e);
            // console.log(e);
        }
    }

    async initIsBrightIDIdchainLinked() {
        try {
            const addr = await this.getWalletAddress();

            this.isBrightIDIdchainLinked = await this.queryBrightIDIdchainLink(
                addr
            );

            return this.isBrightIDIdchainLinked;
        } catch (e) {
            // console.error(e);
            // console.log(e);
        }
    }

    async initIsBrightIDLinked() {
        try {
            const addr = await this.getWalletAddress();

            this.isBrightIDLinked = await this.queryBrightIDLink(addr);

            return this.isBrightIDLinked;
        } catch (e) {
            // console.error(e);
            // console.log(e);
        }
    }

    async initIsSponsoredViaContract() {
        try {
            const addr = await this.getWalletAddress();

            this.isSponsoredViaContract = await this.queryBrightIDSponsorship(
                addr
            );

            return this.isSponsoredViaContract;
        } catch (e) {
            // console.error(e);
            // console.log(e);
        }
    }

    async initIsVerifiedViaContract() {
        try {
            const addr = await this.getWalletAddress();

            this.isVerifiedViaContract = await this.queryBrightIDVerification(
                addr
            );

            return this.isVerifiedViaContract;
        } catch (e) {
            // console.error(e);
            // console.log(e);
        }
    }

    /* Interactive Events */
    /* ---------------------------------------------------------------------- */

    async connectWallet() {
        return await this.getInstance();
    }

    async chooseWallet() {
        return await this.getFreshInstance();
    }

    async faucetClaim() {
        const addr = await this.getWalletAddress();

        const request = new Request(this.props.faucetClaimURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            body: JSON.stringify({ addr: addr }),
        });

        return await fetch(request);
    }

    async switchToIDChainNetwork() {
        const registrationHexChainId = ethers.utils.hexlify(
            Number(this.props.registrationChainId)
        );

        const provider = await this.getProvider();

        return await provider.provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: registrationHexChainId }],
        });
    }

    async addIDChainNetwork() {
        const registrationHexChainId = ethers.utils.hexlify(
            Number(this.props.registrationChainId)
        );

        const provider = await this.getProvider();

        return await provider.provider.request({
            method: "wallet_addEthereumChain",
            params: [
                {
                    chainId: registrationHexChainId,
                    chainName: this.props.registrationChainName,
                    nativeCurrency: {
                        name: this.props.registrationTokenName,
                        symbol: this.props.registrationTokenName,
                        decimals: Number(this.props.registrationTokenDecimal),
                    },
                    rpcUrls: [this.props.registrationRpcUrl],
                    blockExplorerUrls: [
                        this.props.registrationBlockExplorerUrl,
                    ],
                    iconUrls: [this.props.registrationIconUrl],
                },
            ],
        });
    }

    async sponsorViaContract() {
        const chainId = await this.initChainId();

        if (chainId !== Number(this.registrationChainId)) {
            throw new Error(
                `Please switch to the ${this.registrationChainName} network first.`
            );
        }

        const addr = await this.getWalletAddress();

        const contract = await this.getContractRw();

        return await contract.sponsor(addr);
    }

    async verifyViaContract() {
        const chainId = await this.initChainId();

        if (chainId !== Number(this.registrationChainId)) {
            throw new Error(
                `Please switch to the ${this.registrationChainName} network first.`
            );
        }

        const addr = await this.getWalletAddress();

        const verificationData = await this.queryBrightIDSignature(addr);

        const contract = await this.getContractRw();

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

        return await contract.verify(addrs, timestamp, v, r, s);
    }
}

export default IdchainRegistrationModel;
