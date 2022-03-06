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
} from '@chakra-ui/react'
import type { NextPage } from 'next'
import { useEthers, useCall, useToken } from '@usedapp/core'
import { Contract } from '@ethersproject/contracts'
import { TOKEN_ABI, TOKEN_ADDRESS } from '../constants'
import Status from '../components/Status'

// TODO: Fix timer for boss to update every block
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

const Home: NextPage = () => {
  const { activateBrowserWallet, account, chainId } = useEthers()
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
            label={account ? account : 'Click to connect your wallet'}
          >
            <Button size="xs" pb="6px" onClick={activateBrowserWallet}>
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
      </Box>
    </>
  )
}

export default Home
