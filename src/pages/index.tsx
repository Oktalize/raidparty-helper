import { useEffect, useState } from 'react'
import {
  Container,
  Heading,
  Text,
  Button,
  Box,
  Img,
  Flex,
  Tooltip,
  Link,
  Progress,
} from '@chakra-ui/react'
import type { NextPage } from 'next'
import { ethers } from 'ethers'
import { TOKEN_ABI, TOKEN_ADDRESS, BOSS_TYPES } from '../constants'
import Claim from '../components/Claim'
import Status from '../components/Status'

const Home: NextPage = () => {
  const [currentAccount, setCurrentAccount] = useState(null)
  const [tokenBalance, setTokenBalance] = useState(0)
  const [unclaimedBalance, setUnclaimedBalance] = useState(0)
  const [blockNum, setBlockNum] = useState(0)
  const [bossHealth, setBossHealth] = useState(0)
  const [bossMaxHealth, setBossMaxHealth] = useState(0)
  const [raidDmg, setRaidDmg] = useState(0)
  const [bossTypeNum, setBossTypeNum] = useState(0)
  const [nextCfti, setNextCfti] = useState(0)
  const [bossCfti, setBossCfti] = useState(0)
  const [pending, setPending] = useState(false)
  const [badChain, setBadChain] = useState(false)

  const updateCFTI = async (provider: any, account: any) => {
    const cftiContract = new ethers.Contract(
      TOKEN_ADDRESS['CFTI'],
      TOKEN_ABI,
      provider
    )
    cftiContract.balanceOf(account).then((value: any) => {
      setTokenBalance(Number(value) / 10 ** 18)
    })

    const claimContract = new ethers.Contract(
      TOKEN_ADDRESS['CFTIClaimer'],
      TOKEN_ABI,
      provider
    )
    claimContract.getPendingRewards(account).then((value: any) => {
      setUnclaimedBalance(Number(value) / 10 ** 18)
    })

    const partyContract = new ethers.Contract(
      TOKEN_ADDRESS['PARTY'],
      TOKEN_ABI,
      provider
    )
    partyContract.getDamage(account).then((dpb: any) => {
      const raiderDPB = Number(dpb)
      setRaidDmg(raiderDPB)
      const raidContract = new ethers.Contract(
        TOKEN_ADDRESS['RAID'],
        TOKEN_ABI,
        provider
      )
      raidContract.getRaidData().then((raid: any) => {
        const bossNum = Number(raid.boss)
        setBossTypeNum(bossNum)
        raidContract.bosses(Number(raid.boss)).then((boss: any) => {
          const blocksLeft = Number(raid.health)
          const maxHealth = Number(raid.maxHealth)
          const multiplier = Number(boss.multiplier)
          setBossHealth(blocksLeft)
          setBossMaxHealth(maxHealth)
          setBossCfti((maxHealth * multiplier * raiderDPB) / 10 ** 18)
          setNextCfti((blocksLeft * multiplier * raiderDPB) / 10 ** 18)
        })
      })
    })
  }

  const checkWalletIsConnected = async () => {
    const { ethereum }: any = window

    if (!ethereum) {
      console.log('Make sure you have Metamask installed!')
      return
    } else {
      console.log("Wallet exists! We're ready to go!")
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' })

    if (accounts.length !== 0) {
      const account = accounts[0]
      console.log('Found an authorized account: ', account)
      setCurrentAccount(account)
      const provider = new ethers.providers.Web3Provider(ethereum)
      const { chainId } = await provider.getNetwork()
      if (chainId === 1) {
        setBadChain(false)
        updateCFTI(provider, account)
        provider.on('block', (block) => {
          updateCFTI(provider, account)
          setBlockNum(block)
        })
      } else {
        setBadChain(true)
      }
    } else {
      console.log('No authorized account found')
    }
  }

  const connectWalletHandler = async () => {
    const { ethereum }: any = window

    if (!ethereum) {
      alert('Please install Metamask!')
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      console.log('Found an account! Address: ', accounts[0])
      setCurrentAccount(accounts[0])
      checkWalletIsConnected()
    } catch (err) {
      console.log(err)
    }
  }

  const claimTokens = async () => {
    try {
      const { ethereum }: any = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const { chainId } = await provider.getNetwork()
        if (chainId === 1) {
          setBadChain(false)
          const signer = provider.getSigner()
          const claimContract = new ethers.Contract(
            TOKEN_ADDRESS['RAID'],
            TOKEN_ABI,
            signer
          )

          console.log('Initialize claim')
          let claimTxn = await claimContract.claimRewards(currentAccount)

          setPending(true)

          console.log('Claiming... please wait')
          await claimTxn.wait()

          alert(`You got tokens on the way!`)
          setPending(false)
        } else {
          setBadChain(true)
        }
      } else {
        console.log('Ethereum object does not exist')
      }
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    // const runCheck = () =>{
    //   checkWalletIsConnected();
    // }
    // window.addEventListener("focus", runCheck, false);
    // return () => {
    //   window.removeEventListener("focus", runCheck)
    // }
  }, [pending])

  return (
    <>
      <Flex justifyContent="center" p="10px">
        <Heading pt="20px" size="lg" mb="90px" textAlign="center" color="white">
          <Img w="16rem" src="/logo.png" /> Helper Tool
        </Heading>
        <Flex mt="25px" position="absolute" w="95%" justifyContent="right">
          <Tooltip
            bg="purple.300"
            color="white"
            placement="left"
            hasArrow
            label={
              currentAccount ? currentAccount : 'Click to connect your wallet'
            }
          >
            <Button size="xs" pb="6px" onClick={connectWalletHandler}>
              {currentAccount ? 'Connected' : 'Connect Wallet'}
            </Button>
          </Tooltip>
        </Flex>
      </Flex>
      {badChain && (
        <>
          <Text color="red" textAlign="center" fontSize="xl">
            Error: Please connect to Mainnet.
          </Text>
        </>
      )}
      <Container maxW="100%">
        <Status
          bossTypeNum={bossTypeNum}
          bossCfti={bossCfti}
          nextCfti={nextCfti}
          bossHealth={bossHealth}
          bossMaxHealth={bossMaxHealth}
          raidDmg={raidDmg}
        />
        <Claim
          unclaimedBalance={unclaimedBalance}
          tokenBalance={tokenBalance}
          pending={pending}
          claimTokens={claimTokens}
        />
      </Container>
      <Box mt="100px" textAlign="center" textColor="white.50">
        <Text fontSize="xs" color="white">
          Important: This an unofficial utility for accessing{' '}
          <Link color="purple.900" href="https://raid.party/">
            Raid Party
          </Link>{' '}
          contracts.{' '}
        </Text>
        <Text fontSize="xs" color="white">
          This is not officially endorsed, but you can review the source code
          yourself{' '}
          <Link
            color="purple.900"
            href="https://github.com/Oktalize/raidparty-helper"
          >
            here
          </Link>
          .
        </Text>
      </Box>
      <Box mt="50px" textAlign="center">
        <Text fontSize="xs" color="white">
          Made by:{' '}
          <Link color="purple.900" href="https://oktal.eth.link">
            oktal.eth
          </Link>
        </Text>
      </Box>
    </>
  )
}

export default Home
