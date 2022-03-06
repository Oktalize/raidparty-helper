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
  Input,
} from '@chakra-ui/react'
import type { NextPage } from 'next'
import { ethers } from 'ethers'
import { useEthers, useCall, useToken } from '@usedapp/core'
import { Contract } from '@ethersproject/contracts'
import { TOKEN_ABI, TOKEN_ADDRESS } from '../constants'
import Claim from '../components/Claim'
import Status from '../components/Status'

// TODO: (in widget) Estimated time remaining for boss
// TODO: Move inline styles into chakra theme
// TODO: Move more functions into separate files
// TODO: More layout changes
// TODO: Ability to track multiple wallets and aggregate the data
// TODO: Maybe on hover over each account shows pending cfti + wallet
// TODO: URL path for easy saving/sharing
// TODO: Maybe remove claiming all together and turn app readOnly
// TODO: General app cleanup, constants, etc

type RaidBoss = {
  weight: any
  blockHealth: any
  multiplier: any
}

const formatUnits = (number: any, decimal: any) => {
  return Number(number) / 10 ** decimal
}

const usePartyDPB = (address: string | null | undefined) => {
  const { value, error } =
    useCall(
      address && {
        contract: new Contract(TOKEN_ADDRESS['PARTY'], TOKEN_ABI), // instance of called contract
        method: 'getDamage', // Method to be called
        args: [address], // Method arguments
      }
    ) ?? {}
  if (error) {
    console.error(error.message)
    return 0
  }
  return value ? Number(value?.[0]) : 0
}
const useRaidBosses = (boss: number | null | undefined) => {
  const { value, error } =
    useCall({
      contract: new Contract(TOKEN_ADDRESS['RAID'], TOKEN_ABI), // instance of called contract
      method: 'bosses', // Method to be called
      args: [boss], // Method arguments
    }) ?? {}
  if (error) {
    console.error(error.message)
    return undefined
  }
  return value as unknown as RaidBoss
}

const useRaidData = () => {
  const { value, error } =
    useCall({
      contract: new Contract(TOKEN_ADDRESS['RAID'], TOKEN_ABI), // instance of called contract
      method: 'getRaidData', // Method to be called
      args: [], // Method arguments
    }) ?? {}
  if (error) {
    console.error(error.message)
    return 0
  }

  // console.log(value)
  return value?.[0]
}

const useUnclaimedCFTI = (address: string | null | undefined) => {
  const { value, error } =
    useCall(
      address &&
        TOKEN_ADDRESS['RAID'] && {
          contract: new Contract(TOKEN_ADDRESS['RAID'], TOKEN_ABI), // instance of called contract
          method: 'getPendingRewards', // Method to be called
          args: [address], // Method arguments
        }
    ) ?? {}
  if (error) {
    console.error(error.message)
    return undefined
  }
  return value?.[0]
}

const useCFTIBalance = (address: string | null | undefined) => {
  const { value, error } =
    useCall(
      address && {
        contract: new Contract(TOKEN_ADDRESS['CFTI'], TOKEN_ABI), // instance of called contract
        method: 'balanceOf', // Method to be called
        args: [address], // Method arguments
      }
    ) ?? {}
  if (error) {
    console.error(error.message)
    return 0
  }
  return value?.[0]
}

const Home: NextPage = () => {
  const [pending, setPending] = useState(false)
  const [badChain, setBadChain] = useState(false)
  const { activateBrowserWallet, account, chainId, library } = useEthers()
  const [currentAccount, setCurrentAccount] = useState(account || '0x0')
  const CFTI = useToken(TOKEN_ADDRESS['CFTI'])
  const CFTIBalance = formatUnits(
    useCFTIBalance(currentAccount),
    CFTI?.decimals
  )
  const unclaimedCFTI = formatUnits(
    useUnclaimedCFTI(currentAccount),
    CFTI?.decimals
  )
  const raidDmg = usePartyDPB(currentAccount)
  const raidData = useRaidData()
  const raidBoss = useRaidBosses(Number(raidData?.boss))

  const checkWalletIsConnected = async () => {
    if (account) {
      setCurrentAccount(account)
      console.log('Found an authorized account: ', account)
      if (chainId === 1) {
        setBadChain(false)
      } else {
        setBadChain(true)
      }
    } else {
      console.log('No authorized account found')
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
    checkWalletIsConnected()
  }, [account])

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
            label={account ? account : 'Click to connect your wallet'}
          >
            <Button size="xs" pb="6px" onClick={activateBrowserWallet}>
              {account ? 'Connected' : 'Connect Wallet'}
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
        <Flex justify="center" mb="60px">
          <Input
            w="395px"
            textAlign="center"
            placeholder={account ? account : '0x0'}
            value={currentAccount}
            onChange={({ target }) => setCurrentAccount(target.value)}
          />
        </Flex>
        <Status
          bossTypeNum={Number(raidData?.boss)}
          bossHealth={raidData?.health}
          bossMaxHealth={raidData?.maxHealth}
          raidDmg={raidDmg}
          multiplier={raidBoss?.multiplier}
        />
        <Claim
          unclaimedBalance={unclaimedCFTI}
          tokenBalance={CFTIBalance}
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
