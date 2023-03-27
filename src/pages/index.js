import { ConnectButton } from '@rainbow-me/rainbowkit';
import React from 'react';
import { Divider, InputNumber, Button, List, Select } from "antd";
import { useState, useEffect } from "react";
import { useAccount,useContractRead, useWaitForTransaction,
  useContractEvent, useContractWrite, usePrepareContractWrite } from "wagmi";
import { ethers } from "ethers";
import blueContract from "../contracts/blue.json"; // Raw ABI import (pulled from etherscan)
import floorContract from "../contracts/floorLend.json"; // Raw ABI import (pulled from etherscan)
import smolContract from "../contracts/smol.json"; // Raw ABI import (pulled from etherscan)
import { Alchemy, Network } from "alchemy-sdk";
  
const Home = () => {
const settings = {
  apiKey: "lIguUBlNorQF0qVOvhyXc57Tkgk3JynZ", // Replace with your Alchemy API Key.
  network: Network.ARB_MAINNET, // Replace with your network.
};

const alchemy = new Alchemy(settings);

let maxLoanBerries = 0.24 ;
let maxLoanSmols = 0.3 ;

  const BLUE_ADDRESS ="0x17f4BAa9D35Ee54fFbCb2608e20786473c7aa49f";
  const FLOOR_LENDING ="0x0CbD649a6bC932D5F9e5A4ed9522120bCb42E433";
  const SMOL_ADDRESS = "0x6325439389e0797ab35752b4f43a14c004f22a9c"
  // Smoll Collection is position 2 in nmappings, but its collectionID number is 1

  const [ownerTokens2, setOwnerTokens] = useState(0);
  const [tokenURI, setNftTokens] = useState(0);   // the id of the NFT eg 5674, 23, 6013
  const [lendBalance2, setLendBalance] = useState(0);
  const {address, isConnected} = useAccount();
  // const [yourCollectibles2, setYourCollectibles2] = useState(0);
  const [collectionNumber, setCollectionNumber] = useState(0);  // indenitifies the NFT collection to be used 
  const [NFTid, setNFTid] = useState("0");
  const [loanAmount, setLoanAmount] = useState(.24);   
  const [loanAmountStr, setLoanAmountStr] = useState("");    // puts the eth amount of the loan into string format  
  const [loanDays, setNFTDays] = useState(1);  // length of loan in days 
  const [borrowFee, setBorrowFee] = useState(0); 
  const [loanDetails, setLoanDetails] = useState("");
  const [repayDetails, setRepayEvent] = useState("");
  const [yourCollectibles2, setYourCollectibles2] = useState();
  const [loanInfoString, setMaxLoanString] = useState("Maximum loan size for GMX Blueberries is " + maxLoanBerries + " ETH");
  const [isBerry, setIsBerry] = useState(true);
  const [dueDate, setDueDate] = useState();
  const [txHash, setTxHash] = useState();  

  const contractConfig = {
    address: BLUE_ADDRESS,
    abi: blueContract,
  };

  const contractConfig2 = {
    address: FLOOR_LENDING,
    abi: floorContract,
  };

  const contractConfig3 = {
    address: SMOL_ADDRESS,
    abi: smolContract,
  };
   //  function to call contract lend write function to Lend using Blueberry NFT collectionNumber 0
  const { config: loan, error: loanError } = usePrepareContractWrite({
    ...contractConfig2,
    functionName: "lend",
    args: [NFTid, loanDays, collectionNumber, ethers.utils.parseEther(loanAmount + "")], //hardcoded address can create a state variable
    onError(error) {
      console.log("Error", error);
    },
  });
  const {
    data: lendData,              // use this to get tx hash
    write: callLoan, 
  } = useContractWrite(loan);


   //  function to call contract approve lendingcontract to use Blueberry NFT  
  const { config: approveLending, error: adminError } = usePrepareContractWrite({
    ...contractConfig,
    functionName: "approve",
    args: [FLOOR_LENDING, NFTid], //hardcoded address can create a state variable
    onError(error) {
      console.log("Error", error);
    },
  });
  const {
    data: appoveData,              // use this to get tx hash
    write: approveLend, 
  } = useContractWrite(approveLending);

   //  function to call contract approve lendingcontract to use Smol NFT  
  const { config: approveSmolLending, error: smolApproveError } = usePrepareContractWrite({
    ...contractConfig3,
    functionName: "approve",
    args: [FLOOR_LENDING, NFTid], //hardcoded address can create a state variable
    onError(error) {
      console.log("Error", error);
    },
  });
  const {
    data: smolData,              // use this to get tx hash
    write: approveSmolLend, 
  } = useContractWrite(approveSmolLending);

   // tracks the approve call for lend contract on GMX blueberries
 const {isSuccess: txSuccess} = useWaitForTransaction({
    hash: appoveData?.hash
  })
    // tracks the approve call for lend contract on Smol Brains
    const {isSuccess: txSmolSuccess} = useWaitForTransaction({
      hash: smolData?.hash
    }) 
   // tracks the lend call for loan using GMX blueberry or SMOL
  const {isSuccess: txSuccessLend} = useWaitForTransaction({
    hash: lendData?.hash
  })

  const isApproved = txSuccess          // checks if approval has gone through
  const isLent = txSuccessLend          // checks if loan for GMX blueberry has been confirmed
  const isSmolApproved = txSmolSuccess  // checks if approval has gone through

  /* ********************** EVENTS ***************************************************** */
  // a loan has been created for a GMX blueberry or SMOL
  useContractEvent({
    address: FLOOR_LENDING,
    abi: floorContract,
    eventName: 'loanEvent',
    listener(sender, NFTid, collectionID ,loanAmount, dueDate) {
      setNFTid(NFTid)
      setDueDate(getDate(dueDate))
      console.log("Due date ", dueDate)
     },
  })
  //  a loan has been repaid
  useContractEvent({
    address: FLOOR_LENDING,
    abi: floorContract,
    eventName: 'repayLoanEvent',
    listener(NFTid, sender ,loanAmount) {
      setRepayEvent("SUCCESSFULLY REPAID -  NFTid " + NFTid + " Repay amount : " + ethers.utils.formatEther(loanAmount + ""))
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

  const { data: getBorrowFee, error: calcBorrowFee } = useContractRead({
    ...contractConfig2,
    functionName: "calculateBorrowFee",
    args: [NFTid, collectionNumber], //address and colelction ID 
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

  function getDate(dt) {
    const milliseconds = dt * 1000 // 1575909015000
    const dateObject = new Date(milliseconds)
    let humanDateFormat = dateObject.toLocaleString() //2019-12-9 10:30:15
    return humanDateFormat;
  }

  /* approve the transfer of NFT on the Blueberry contract
  const handleClick = async (event, message) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const marketContract = new ethers.Contract("0x17f4BAa9D35Ee54fFbCb2608e20786473c7aa49f", blueContract, provider);
    const marketWithSigner = marketContract.connect(signer); 
    try{  
      await marketWithSigner.approve(FLOOR_LENDING, message);
    }catch(e) {alert ("approve error"); console.log(e);}
  };
  */

  // uses alchemy API to display NFTs owned by user for blueberry collection
  //   0x6325439389e0797ab35752b4f43a14c004f22a9c .Smol Brain  0xbe56F9Ac7E0b9232Adb86540fa69F1dE7b43995f
  const getSmol = async () => {
    setLoanAmount(maxLoanSmols)
    if(isConnected==true)  // check wallet is connected
    {
      const nftsForOwner = await alchemy.nft.getNftsForOwner(address);
      const nftList = nftsForOwner["ownedNfts"]; 
      const collectibleUpdate = [];
      for (let nft of nftList) {
        try{
          if (nft.contract.address == "0x6325439389e0797ab35752b4f43a14c004f22a9c")
          {console.log(` ${nft.tokenId} ` );
          let addr = "https://ipfs.io/ipfs/QmWV1wuqxdY2VcyQFVVK9KXuHSzv7FRnX8GKeo9NSrmZX4/image/" + nft.tokenId + "/5.png";
          collectibleUpdate.push({ id: nft.tokenId, image: addr, owner: address});
         }
        }
        catch(e) {alert (e, "NFT Error")}
      } 
      setYourCollectibles2(collectibleUpdate);
    }else
    alert("Please connect a wallet")
  };

  // uses alchemy API to display NFTs owned by user for blueberry collection
  const getBerry = async () => {
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

     // input number handler for NFT ID
     const changeDuration = value => {
      let maxLoan=0
      if(collectionNumber==0)
        maxLoan = maxLoanBerries
      else
        maxLoan = maxLoanSmols
      try{
       let a =0
       setNFTDays(value);
       a = (maxLoan -(value * .005)).toFixed(2)    
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

  // Calls the WRITE lend function in the Floorlend contract
  const callLend = async (event, nftNumber) =>{ 
    var date = new Date();
    setNFTid(nftNumber)
    setLoanAmountStr(ethers.utils.parseEther(loanAmount + "")) ;
    console.log( ethers.utils.parseEther(loanAmount + ""),  " NFTID ", NFTid, "amount ", loanAmount, " collection " , collectionNumber, " due date" , date.getDate()  )
    setLoanDetails("Loan Details : NFTid " + NFTid + " Loan amount : " + loanAmount  + " eth due in " + date.setDate(date.getDate() + loanDays))
    callLoan?.()

   }

   // calls the approve() function in the Blueberry or SMol contracts depending on the selection
  const approve = async (event, id) =>{ 
    setNFTid(id)
    console.log("APPROVE LEND NFT ID ",id , "Collection ID " , collectionNumber)
    if (collectionNumber==0){
      approveLend?.()
    }else{
      approveSmolLend?.()
    }

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
        await marketWithSigner.repayLoan(nftNumber, collectionNumber,{value: borrowFee});
        }
        catch(e) {alert (e, "repay error"); console.log(e);}
    }
  }

   // input number handler for NFT ID
   const onChange2 = value => {
    setNFTid(value);
  };

  const handleChange = (value) => {
    setCollectionNumber(value)
    if(value==0)
     {setMaxLoanString("Maximum loan size for GMX Blueberries is " + maxLoanBerries + " ETH")
      setIsBerry(true)}
    else{
      setMaxLoanString("Maximum loan size for Smol Brains is " + maxLoanSmols + " ETH") 
      setIsBerry(false)
    }
        
  };

  return (
<div className="App">

<div style={{textAlign: "center"}} suppressHydrationWarning={true}>
<table style={{marginLeft: "auto", marginRight: "auto"}}  ><thead>
 <tr><th><ConnectButton showBalance={true} /> </th></tr></thead></table>
<h1 style={{ fontSize: 30 }}>FLOOR 101 NFT Lending (beta)</h1> 
  <h3>You own {ownerTokens2.toString()} Blueberries</h3>
  <Select defaultValue="GMX Blueberry Club" style={{width: 200,}} onChange={handleChange}
      options={[
        {value: '0', label: 'GMX Blueberry Club',},
        {value: '2',label: 'Smol Brains - coming soon', },
      ]}
    />
  <h3>Lending Contract has { ethers.utils.formatEther(lendBalance2.toString()).substring(0,6) } ETH available</h3>
  <h3>{loanInfoString}</h3>
  { isBerry && (
 <Button type="primary" shape="round" onClick={() => getBerry()}>Display My Blueberries</Button>  
  )}
  { !isBerry && (
 <Button type="primary" shape="round" onClick={() => getSmol()}>Display Smol Brain</Button>  
  )}
 <List id="centerWrapper !important" dataSource={yourCollectibles2} renderItem={item => {
                    return (
<List.Item>
  Item ID {item.id}<br />
{<img src= {item.image} width={100} />} 
<table padding = {25} style={{marginLeft: "auto", marginRight: "auto"}} ><thead>
<tr><th>Nft ID : </th><th><InputNumber min={1} max={13000} defaultValue={item.id} onChange={setNFTid} style={{ width: 200 }} /></th></tr>
<tr><th>Loan Duration : </th><th>
 <InputNumber min={1} max={28} placeholder={"Loan Duration"} defaultValue={1} onChange={changeDuration} style={{ width: 200 }} />
 </th></tr>
 <tr><th>Loan Amount : </th><th>
 <InputNumber min={.1} max={maxLoanBerries} step={0.01} value={loanAmount} onChange={changeLoan} style={{ width: 200 }} />
 </th></tr></thead></table>

 <Button type="primary" shape="round"  onClick={(event) => approve(event, item.id)}  >Approve Lending</Button> 
 
  {isConnected && isApproved && (
 <Button type="primary" shape="round" onClick={(event) => callLend(event, NFTid)} style={{ width: 140}}>Lend
 </Button>  
 )}
  {isConnected && isSmolApproved && (
 <Button type="primary" shape="round" onClick={(event) => callLend(event, NFTid)} style={{ width: 140}}>Lend
 </Button>  
 )}

 <br />
 {isConnected && isLent && (
  <div>Loan Amount {loanAmount} Due date : {dueDate} <a rel="noreferrer" target="_blank" href={`https://arbiscan.io/tx/${lendData?.hash}` }>view on etherscan</a></div>
 )}
 </List.Item>
);}}/>
 
 <Divider />
 <h1 style={{fontSize: 30}}>Repay Loan</h1>
 <Select defaultValue="GMX Blueberry Club" style={{width: 200,}} onChange={handleChange}
      options={[
        {value: '0', label: 'GMX Blueberry Club',},
        {value: '2',label: 'Smol Brains', },
      ]}
    /><br />
 <InputNumber min={1} max={12100} placeholder={"NFT ID"} onChange={onChange2} style={{width: 200, marginBottom: 10 }} /><br />
 <Button type="primary" shape="round" onClick={(event) => repayFloor(event, NFTid)} >REPAY LOAN</Button><br />
 Repay Loan Details {repayDetails}
 <Divider />
 <br />
 <a href="https://arbiscan.io/address/0x0CbD649a6bC932D5F9e5A4ed9522120bCb42E433#code"  rel="noreferrer" target="_blank">View Contract</a><br />
 <a href="https://twitter.com/pcashpeso" target="_blank"  rel="noreferrer"  style={{ color: "blue" }}>Click here for tech support on Twitter from Jollibee</a>
 <br /> <br /> <br /> <br />
 </div>

</div>
  );
};

export default Home;

