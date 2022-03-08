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
} from '@chakra-ui/react'
import type { NextPage } from 'next'
import { useEthers, useCall, useToken } from '@usedapp/core'
import { Contract } from '@ethersproject/contracts'
import { CFTILP_ABI, ETHUSD_ABI, TOKEN_ABI, TOKEN_ADDRESS } from '../constants'
import Status from '../components/Status'
import { useState } from 'react'
import Donate from '../components/Donate'

// TODO: Fix timer for boss to update every block
// TODO: Boss table for calculating your CFTI earnings based on boss
// TODO: Move inline styles into chakra theme
// TODO: Move more functions into separate files
// TODO: More layout changes
// TODO: Ability to track multiple wallets and aggregate the data
// TODO: Maybe on hover over each account shows pending cfti + wallet
// TODO: URL path for easy saving/sharing
// TODO: General app cleanup, constants, etc

type RaidBoss = {
  weight: any
  blockHealth: any
  multiplier: any
}

type CFTIETHProps = {
  reserve0: any
  reserve1: any
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
  const bossNum = boss ? boss : 0
  const { value, error } =
    useCall({
      contract: new Contract(TOKEN_ADDRESS['RAID'], TOKEN_ABI), // instance of called contract
      method: 'bosses', // Method to be called
      args: [bossNum], // Method arguments
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

const useCFTIPrice = () => {
  const { value, error } =
    useCall({
      contract: new Contract(TOKEN_ADDRESS['CFTILP'], CFTILP_ABI), // instance of called contract
      method: 'getReserves', // Method to be called
      args: [], // Method arguments
    }) ?? {}
  if (error) {
    console.error(error.message)
    return 0
  }
  return value
}

const useETHUSDPrice = () => {
  const { value, error } =
    useCall({
      contract: new Contract(TOKEN_ADDRESS['ETHUSD'], ETHUSD_ABI), // instance of called contract
      method: 'latestRoundData', // Method to be called
      args: [], // Method arguments
    }) ?? {}
  if (error) {
    console.error(error.message)
    return 0
  }
  return value
}

const calculateCFTIPrice = (CFTIPrice: any, ETHUSDPrice: any) => {
  const CFTIETH =
    formatUnits(CFTIPrice?._reserve0, 18) /
    formatUnits(CFTIPrice?._reserve1, 18)
  return CFTIETH * formatUnits(ETHUSDPrice?.answer, 8)
}

const Home: NextPage = () => {
  const { activateBrowserWallet, deactivate, account, chainId } = useEthers()
  const [usdToggled, setUsdToggled] = useState(false)
  const CFTIUSDPrice = calculateCFTIPrice(useCFTIPrice(), useETHUSDPrice())
  const CFTI = useToken(TOKEN_ADDRESS['CFTI'])
  const CFTIBalance = formatUnits(useCFTIBalance(account), CFTI?.decimals)
  const unclaimedCFTI = formatUnits(useUnclaimedCFTI(account), CFTI?.decimals)
  const raidDmg = usePartyDPB(account)
  const raidData = useRaidData()
  const raidBoss = useRaidBosses(Number(raidData?.boss))

  return (
    <>
      <Flex justifyContent="center" p="10px">
        <Heading pt="20px" size="lg" mb="50px" textAlign="center" color="white">
          <Img w="16rem" src="/logo.png" /> Tracker
        </Heading>
        <Flex mt="25px" position="absolute" w="95%" justifyContent="right">
          <Tooltip
            bg="purple.300"
            color="white"
            placement="left"
            hasArrow
            label={'Click to toggle between CFTI and USD'}
          >
            {account ? (
              <Button
                size="xs"
                pb="6px"
                mr="20px"
                onClick={() => {
                  setUsdToggled(!usdToggled)
                }}
              >
                CFTI: ${CFTIUSDPrice.toFixed(2)}
              </Button>
            ) : (
              <></>
            )}
          </Tooltip>
          <Tooltip
            bg="purple.300"
            color="white"
            placement="left"
            hasArrow
            label={account ? account : 'Click to connect your wallet'}
          >
            <Button
              size="xs"
              pb="6px"
              onClick={() => {
                if (account) {
                  deactivate()
                } else {
                  activateBrowserWallet()
                }
              }}
            >
              {account ? 'Connected' : 'Connect Wallet'}
            </Button>
          </Tooltip>
        </Flex>
      </Flex>
      {account && chainId !== 1 && (
        <>
          <Text color="red" textAlign="center" fontSize="xl">
            Error: Please connect to Ethereum Mainnet.
          </Text>
        </>
      )}
      <Container maxW="100%">
        <Status
          connected={account}
          bossTypeNum={Number(raidData?.boss)}
          bossHealth={raidData?.health}
          bossMaxHealth={raidData?.maxHealth}
          raidDmg={raidDmg}
          multiplier={raidBoss?.multiplier}
          unclaimedBalance={unclaimedCFTI}
          tokenBalance={CFTIBalance}
          usdPrice={CFTIUSDPrice}
          usdToggled={usdToggled}
        />
      </Container>
      <Box mt="80px" textAlign="center" textColor="white.50">
        <Text fontSize="xs" color="white">
          Important: This an unofficial utility for tracking{' '}
          <Link color="purple.900" href="https://raid.party/">
            Raid Party
          </Link>
          .{' '}
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
      <Box mt="30px" textAlign="center">
        <Text fontSize="xs" color="white">
          Made by:{' '}
          <Link
            color="purple.900"
            href="https://oktal.eth.link"
            target="_blank"
          >
            oktal.eth
          </Link>
        </Text>
        <Text fontSize="xs" color="white">
          Twitter:{' '}
          <Link
            color="purple.900"
            href="https://twitter.com/oktalize"
            target="_blank"
          >
            @oktalize
          </Link>
        </Text>
        <Donate />
      </Box>
    </>
  )
}

export default Home
