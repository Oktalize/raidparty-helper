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

  const bossPercent = () => {
    return ((bossHealth / bossMaxHealth) * 100 - 100) / -1
  }

  useEffect(() => {
    // const runCheck = () =>{
    //   checkWalletIsConnected();
    // }

    // window.addEventListener("focus", runCheck, false);

    checkWalletIsConnected()
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
        <Heading>Boss {bossTypeNum}</Heading>
        <Progress value={bossPercent()} colorScheme="red" />
        <Heading>
          CFTI Left: {nextCfti.toFixed(3)} of {bossCfti.toFixed(3)} CFTI
        </Heading>
        <Flex justify="center" w="100%">
          <Box
            mt="48px"
            px="16px"
            py="16px"
            pt="48px"
            w="360px"
            color="purple.900"
            bg="purple.100"
            borderRadius="1px"
            boxShadow="0 -3px 0 0 #352561, 0 3px 0 0 #181030, -3px 0 0 0 #2c2051, 3px 0 0 0 #2c2051, 0 0 0 3px #0b0817, 0 -6px 0 0 #0b0817, 0 6px 0 0 #0b0817, -6px 0 0 0 #0b0817, 6px 0 0 0 #0b0817"
          >
            <Flex mt="-76px" justify="center">
              <Img h="48px" src="/banner-l.png" />
              <Box
                bgImage="/banner-m.png"
                bgSize="48px"
                h="48px"
                w="150px"
                textAlign="center"
              >
                <Text fontSize="lg" mt="-5px" color="white" fontWeight="bold">
                  Your Earnings
                </Text>
              </Box>
              <Img h="48px" src="/banner-r.png" />
            </Flex>
            <Box p="16px" textAlign="center">
              <Text color="purple.800" fontWeight="600">
                Current earnings summary
              </Text>
              <Flex justify="center" m="24px">
                <Box
                  minWidth="140px"
                  px="32px"
                  pt="4px"
                  pb="4px"
                  bg="linear-gradient(180deg,#3d1e78,#27134e 97.03%)"
                  boxShadow="0 -3px 0 0 #562da3, 0 3px 0 0 #562da3, -3px 0 0 0 #562da3, 3px 0 0 0 #562da3, 0 0 0 3px #0f0c1b, 0 -6px 0 0 #0f0c1b, 0 6px 0 0 #0f0c1b, -6px 0 0 0 #0f0c1b, 6px 0 0 0 #0f0c1b"
                >
                  <Text
                    fontSize="xx-large"
                    fontWeight="800"
                    color="white"
                    lineHeight="32px"
                  >
                    {unclaimedBalance.toFixed(3)}
                  </Text>
                  <Text fontWeight="600">CFTI</Text>
                </Box>
              </Flex>
              <Text fontSize="xs">
                Current Balance: {tokenBalance.toFixed(3)}
              </Text>
            </Box>
            <Button disabled={pending} w="100%" onClick={claimTokens}>
              Claim
            </Button>
          </Box>
        </Flex>
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
