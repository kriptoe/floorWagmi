import { ConnectButton } from '@rainbow-me/rainbowkit';
import {  Divider, InputNumber, Button, List } from "antd";
import { useState, useEffect } from "react";
import {
  useAccount,
  useContractRead,
  useContractEvent,
} from "wagmi";
import { ethers } from "ethers";
import blueContract from "../contracts/blue.json"; // Raw ABI import (pulled from etherscan)
import floorContract from "../contracts/floorLend.json"; // Raw ABI import (pulled from etherscan)
import { Alchemy, Network } from "alchemy-sdk";

const Home = () => {
// Optional Config object, but defaults to demo api-key and eth-mainnet.
const settings = {
  apiKey: "lIguUBlNorQF0qVOvhyXc57Tkgk3JynZ", // Replace with your Alchemy API Key.
  network: Network.ARB_MAINNET, // Replace with your network.
};

const alchemy = new Alchemy(settings);

  const BLUE_ADDRESS ="0x17f4BAa9D35Ee54fFbCb2608e20786473c7aa49f";
  const FLOOR_LENDING ="0x0CbD649a6bC932D5F9e5A4ed9522120bCb42E433";

  const [ownerTokens2, setOwnerTokens] = useState(0);
  const [tokenURI, setNftTokens] = useState(0);   // the id of the NFT eg 5674, 23, 6013
  const [lendBalance2, setLendBalance] = useState(0);
  const {address, isConnected} = useAccount();
  // const [yourCollectibles2, setYourCollectibles2] = useState(0);
  const [ownerID, setOwnerID] = useState(0);      // array position of the NFT when looping through owner's nfts
  const [NFTid, setNFTid] = useState("0");
  const [loanAmount, setLoanAmount] = useState(.24);   
  const [loanDays, setNFTDays] = useState(1);  // length of loan in days 
  const [totalLoans, setGetLoansLength] = useState(0); 
  const [borrowFee, setBorrowFee] = useState(0); 
  const [loanDetails, setLoanDetails] = useState("");
  const [repayDetails, setRepayEvent] = useState("");
  const [yourCollectibles2, setYourCollectibles2] = useState();

  let maxLoanBerries = 0.24 ;

  const contractConfig = {
    address: BLUE_ADDRESS,
    abi: blueContract,
  };

  const contractConfig2 = {
    address: FLOOR_LENDING,
    abi: floorContract,
  };

  const test2 = async () => {
    // Print owner's wallet address:
    alert(address)
    return
  const ownerAddr = address;
  console.log("fetching NFTs for address:", ownerAddr);
  // Print total NFT count returned in the response:
  const nftsForOwner = await alchemy.nft.getNftsForOwner(ownerAddr);
  console.log("number of NFTs found:", nftsForOwner.totalCount);
  };

  const test = async () => {
    if(isConnected==true)  // check wallet is connected
    {
      const nftsForOwner = await alchemy.nft.getNftsForOwner(address);
      const nftList = nftsForOwner["ownedNfts"]; 
      const collectibleUpdate = [];
      for (let nft of nftList) {
        try{
          if (nft.contract.address == "0x17f4baa9d35ee54ffbcb2608e20786473c7aa49f")
          {console.log(` ${nft.tokenId} .${nft.rawMetadata.image}` );
          let addr = "https://ipfs.io/ipfs/QmSg4CMhmWdQ17i7pNbd8ENhW3B4Vb1kvMK3pgj7tryaNv/" + nft.tokenId + ".jpg";
          collectibleUpdate.push({ id: nft.tokenId, image: addr, owner: address});
         }
        }
        catch(e) {alert (e, "NFT Error")}
      } 
      setYourCollectibles2(collectibleUpdate);
    }else
    alert("Please connect a wallet")

  };

  /***************************************************************************** */
  // Approve Function - with payable option

  /** @dev Setup Prepare contract to grab information before button execution
   * The information is "Prepared" before you push the button for execution
   */


  /** @dev Pull the "adminMinter" config from the usePrepareContractWrite hook
   *  Put it into the "mintAdmin" function to execute in the front end
   */

  /* ********************** EVENTS ***************************************************** */
  // a loan has been created
  useContractEvent({
    address: FLOOR_LENDING,
    abi: floorContract,
    eventName: 'loanEvent',
    listener(sender, NFTid, collectionID ,loanAmount, dueDate) {
      console.log(" NFTid " + NFTid + " Loan amount : " + ethers.utils.formatEther(loanAmount + "") + " Due date : " + getDate(dueDate))
      setLoanDetails("SUCCESSFULLY REPAID - NFTid " + NFTid + " Loan amount : " + ethers.utils.formatEther(loanAmount + "") + " Due date : " + getDate(dueDate))
     },
  })
  //  a loan has been repaid
  useContractEvent({
    address: FLOOR_LENDING,
    abi: floorContract,
    eventName: 'repayLoanEvent',
    listener(NFTid, sender ,loanAmount) {
      setRepayEvent("sender: " + sender + " NFTid " + NFTid + " Repay amount : " + ethers.utils.formatEther(loanAmount + ""))
       },
  })

  /***************************************************************************** */
  // Read Function
  /** @dev Read the total supply of the token
   *  Data is set to "totalSupply" variable
   * NOTE, THERE IS CURRENTLY A CONSOLE BUG WITH THE READ FUNCTION HOOK
   * The isDataEqual option has been deprecated and will be removed in the next release....
   */

  const { data: ownerTokens, error: ownerError } = useContractRead({
    ...contractConfig,
    functionName: "balanceOf",
    args: [address], //hardcoded address can create a state variable
  });

  const { data: nftTokens, error: getNFTError } = useContractRead({
    ...contractConfig,
    functionName: "tokenOfOwnerByIndex",
    args: [address, 0], //hardcoded address can create a state variable
  });

  const { data: lendBalance, error: getLendBalanceError } = useContractRead({
    ...contractConfig2,
    functionName: "getBalance",
  });

  const { data: getLoansLength, error: getLoansLengthError } = useContractRead({
    ...contractConfig2,
    functionName: "getMappingLength",
    args: [address, 0], //address and colelction ID 
  });

  const { data: getBorrowFee, error: calcBorrowFee } = useContractRead({
    ...contractConfig2,
    functionName: "calculateBorrowFee",
    args: [NFTid, 0], //address and colelction ID 
  });


  /* *************************************************************************** */
  useEffect(() => {
    if (loanDetails) {
      let temp = loanDetails;
      setLoanDetails(temp);
    }
  }, [loanDetails]);

  useEffect(() => {
    if (getBorrowFee) {
      let temp = getBorrowFee;
      setBorrowFee(temp);
    }
  }, [getBorrowFee]);

  useEffect(() => {
    if (ownerTokens) {
      let temp = ownerTokens;
      setOwnerTokens(temp);
    }
  }, [ownerTokens]);

  useEffect(() => {
    if (nftTokens) {
      let temp = nftTokens;
      setNftTokens(temp);
    }
  }, [nftTokens]);

  useEffect(() => {
    if (lendBalance) {
      let temp = lendBalance;
      setLendBalance(temp);
    }
  }, [lendBalance]);

  useEffect(() => {
    if (getLoansLength) {
      let temp = getLoansLength;
      setGetLoansLength(temp);
    }
  }, [getLoansLength]);

  function getDate(dt) {
    const milliseconds = dt * 1000 // 1575909015000
    const dateObject = new Date(milliseconds)
    let humanDateFormat = dateObject.toLocaleString() //2019-12-9 10:30:15
    return humanDateFormat;
  }

   // get all the NFT IDs of the current wallet
  const getNFTs = async ( ) => {
    let str = ""
    setOwnerID(0)   
    alert(  ownerID)
    setOwnerID(1)
     
    alert(  ownerID) 
  };

  const handleClick = async (event, message) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const marketContract = new ethers.Contract("0x17f4BAa9D35Ee54fFbCb2608e20786473c7aa49f", blueContract, provider);
    const marketWithSigner = marketContract.connect(signer); 
    try{  
      await marketWithSigner.approve(FLOOR_LENDING, message);
    }catch(e) {alert ("approve error"); console.log(e);}
  };
  

     // input number handler for NFT ID
     const changeDuration = value => {
      try{
        let a =0
       setNFTDays(value);
       a = (maxLoanBerries -(value * .005)).toFixed(2)    
       setLoanAmount(a);
      } catch (e) {console.log(e);} 
   };

     // input number handler for NFT ID
  const changeLoan = value => {
    setLoanAmount(value);
  };

  const floorLendAbi = [
    "function lend( uint256 tokenId , uint256 loanLength ,uint256 collectionID,uint256  _loanAmount )",
    "function repayLoan( uint256 tokenId , uint256 collectionID )", 
  ];

  const lend = async (event, nftNumber) =>{ 
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const marketContract = new ethers.Contract(FLOOR_LENDING, floorContract, provider);
    const marketWithSigner = marketContract.connect(signer); 
    try{  
      await marketWithSigner.lend(nftNumber, loanDays, 0 ,ethers.utils.parseEther(loanAmount + ""));
    }catch(e) {alert (e, "Lend error"); console.log(e);}setLoanAmount
   }


   /*
   const getLoans= async ( ) => {
    let tokenURI = ""
    let str = ""
    let balance2 = totalLoans;
    alert(totalLoans.toString() + " address " + address)
    return
    for (let i = 0; i < balance2; i++)
     { tokenURI = await readContracts.FloorLendingV2.getLoanID(address, 0, i );
       let due = await readContracts.FloorLendingV2.getDueDate(tokenURI, 0);
        str=str.concat('NFT id : ', tokenURI , ' Due :' ,getDate(due) )
    }
    setDisplayLoans(str)
  };
*/

  // repays the loan using hte borrowFee value which is taken from another contract call
  const repayFloor = async (event, nftNumber) =>{ 
    if(NFTid<1)
    {alert ("Enter the ID of your NFT")}
    else{
      try{
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const marketContract = new ethers.Contract(FLOOR_LENDING, floorContract, provider);
        const marketWithSigner = marketContract.connect(signer); 
        await marketWithSigner.repayLoan(nftNumber, 0,{value: borrowFee});
        }
        catch(e) {alert (e, "repay error"); console.log(e);}
    }

  }

   // input number handler for NFT ID
   const onChange2 = value => {
    setNFTid(value);
  };

  return (
<div style={{textAlign: "center"}} suppressHydrationWarning={true}>
<table style={{marginLeft: "auto", marginRight: "auto"}}  ><thead>
 <tr><th><ConnectButton showBalance={true} /></th></tr></thead></table>


<h1 style={{ fontSize: 30 }}>FLOOR 101 NFT Lending (beta)</h1> 
  <h3>You own {ownerTokens2.toString()} Blueberries</h3>
  <h3 suppressHydrationWarning>Lending Contract has { ethers.utils.formatEther(lendBalance2.toString()).substring(0,6) } ETH available</h3>
 <br /> 
 Enter NFT ID, choose length of loan and amount then approve and lend.
  <table style={{marginLeft: "auto", marginRight: "auto"}}  ><thead>
 <tr><th>Nft ID : </th><th><InputNumber min={1} max={10000} defaultValue={1} onChange={setNFTid} style={{ width: 200 }} /></th></tr>
 <tr><th>Loan Duration : </th><th>
  <InputNumber min={1} max={28} placeholder={"Loan Duration"} defaultValue={1} onChange={changeDuration} style={{ width: 200 }} />
  </th></tr>
  <tr><th>Loan Amount : </th><th>
  <InputNumber min={.1} max={maxLoanBerries} step={0.01} value={loanAmount} onChange={changeLoan} style={{ width: 200 }} />
  </th></tr></thead></table>
 
 <Button type="primary" shape="round" onClick={(event) => handleClick(event, tokenURI)}  style={{ width: 120}}>Approve</Button>{" "}
 <Button type="primary" shape="round" onClick={(event) => lend(event, NFTid)} style={{ width: 120}}>LEND</Button>  
 <Divider />
 <Button type="primary" shape="round" onClick={() => test()}>Display My Blueberries</Button>
 <List id="centerWrapper !important" dataSource={yourCollectibles2} renderItem={item => {
                    return (
<List.Item>
  Item ID {item.id}<br />
{<img src= {item.image} width={100} />} 
<table padding = {25} style={{marginLeft: "auto", marginRight: "auto"}} ><thead>
<tr><th>Nft ID : </th><th><InputNumber min={1} max={10000} defaultValue={item.id} onChange={setNFTid} style={{ width: 200 }} /></th></tr>
<tr><th>Loan Duration : </th><th>
 <InputNumber min={1} max={28} placeholder={"Loan Duration"} defaultValue={1} onChange={changeDuration} style={{ width: 200 }} />
 </th></tr>
 <tr><th>Loan Amount : </th><th>
 <InputNumber min={.1} max={maxLoanBerries} step={0.01} value={loanAmount} onChange={changeLoan} style={{ width: 200 }} />
 </th></tr></thead></table>
 <Button type="primary" shape="round" onClick={(event) => handleClick(event, item.id)} style={{ marginTop: 10, width: 120 }}>Approve</Button>{" "}
 <Button type="primary" shape="round" onClick={(event) => lend(event, item.id)} style={{ marginTop: 10, width: 120 }}>LEND</Button><br />
 Loan Details {loanDetails}
 </List.Item>
);}}/>

 Loan Details {loanDetails}
 
 <Divider />
 <h1 style={{fontSize: 30}}>Repay Loan</h1>
 <InputNumber min={1} max={10100} placeholder={"NFT ID"} onChange={onChange2} style={{width: 200, marginBottom: 10 }} /><br />
 <Button type="primary" shape="round" onClick={(event) => repayFloor(event, NFTid)} >REPAY LOAN</Button><br />
 Repay Loan Details {repayDetails}
 <Divider />
 <br />
 <a href="https://arbiscan.io/address/0x0CbD649a6bC932D5F9e5A4ed9522120bCb42E433#code"  rel="noreferrer" target="_blank">View Contract</a><br />
 <a href="https://twitter.com/pcashpeso" target="_blank"  rel="noreferrer"  style={{ color: "blue" }}>Click here for tech support on Twitter from Jollibee</a>
 <br /> <br /> <br /> <br />
 </div>
      
  );
};

export default Home;

