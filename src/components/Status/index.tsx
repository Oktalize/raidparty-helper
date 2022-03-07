import {
  Text,
  Box,
  Img,
  Flex,
  Progress,
  Grid,
  GridItem,
  Tooltip,
} from '@chakra-ui/react'
import BannerBox from '../Global/BannerBox'

import { BOSS_TYPES } from '../../constants'
import { useState, useEffect } from 'react'

type StatusProps = {
  bossTypeNum?: any
  bossHealth: any
  bossMaxHealth: any
  raidDmg: any
  multiplier: any
  unclaimedBalance: any
  tokenBalance: any
  connected: any
}

const calculateCFTI = ({
  blocks,
  multiplier,
  DPB,
}: {
  blocks: any
  multiplier: any
  DPB: any
}) => {
  if (blocks) {
    return (blocks * multiplier * DPB) / 10 ** 18
  } else {
    return 0
  }
}

const Status = ({
  bossTypeNum,
  bossHealth,
  bossMaxHealth,
  raidDmg,
  multiplier,
  unclaimedBalance,
  tokenBalance,
  connected,
}: StatusProps) => {
  const [counter, setCounter] = useState(0)

  useEffect(() => {
    if (bossHealth) {
      // if (counter === 0) {
      setCounter(bossHealth * 15)
      // } else if (counter > bossHealth * 15) {
      //   setCounter(bossHealth * 15)
      // }
    }
    // const bossTimer = setTimeout(() => {
    //   if (counter > 0) {
    //     setCounter(counter - 1)
    //   }
    // }, 1000)
    // return () => {
    //   clearTimeout(bossTimer)
    // }
  }, [counter, bossHealth])

  const BossCrowns = ({ bossTypeNum }: { bossTypeNum?: any }) => {
    if (bossTypeNum === 0) {
      return (
        <>
          <Img src="/boss-crown-small.png" />
        </>
      )
    } else if (bossTypeNum === 1) {
      return (
        <>
          <Img src="/boss-crown-small.png" />
          <Img src="/boss-crown-small.png" />
        </>
      )
    } else if (bossTypeNum === 2) {
      return (
        <>
          <Img src="/boss-crown-small.png" />
          <Img src="/boss-crown-small.png" />
          <Img src="/boss-crown-small.png" />
        </>
      )
    } else if (bossTypeNum === 3) {
      return (
        <>
          <Img src="/boss-crown-small.png" />
          <Img src="/boss-crown-small.png" />
          <Img src="/boss-crown-small.png" />
          <Img src="/boss-crown-small.png" />
        </>
      )
    } else if (bossTypeNum === 4) {
      return (
        <>
          <Img src="/boss-crown-small.png" />
          <Img src="/boss-crown-small.png" />
          <Img src="/boss-crown-large.png" />
          <Img src="/boss-crown-small.png" />
          <Img src="/boss-crown-small.png" />
        </>
      )
    } else if (bossTypeNum === 5) {
      return (
        <>
          <Img src="/boss-crown-large.png" />
          <Img src="/boss-crown-large.png" />
          <Img src="/boss-crown-large.png" />
          <Img src="/boss-crown-large.png" />
        </>
      )
    } else {
      return (
        <>
          <Img src="/boss-crown-small.png" />
        </>
      )
    }
  }

  const bossPercent = () => {
    return (bossHealth / bossMaxHealth) * 100
  }

  const bossPercentInverse = () => {
    return (bossPercent() - 100) / -1
  }

  const timeLeft = (seconds: number) => {
    var date = new Date(1970, 0, 1)
    date.setSeconds(seconds)
    return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1')
  }

  const bossCfti = calculateCFTI({
    blocks: bossMaxHealth,
    multiplier,
    DPB: raidDmg,
  })
  const nextCfti = calculateCFTI({
    blocks: bossHealth,
    multiplier,
    DPB: raidDmg,
  })

  return (
    <BannerBox heading={'Current Raid'}>
      <Box p="16px" textAlign="center">
        {connected && (
          <Flex justify="center">
            <Flex h="32px">
              <BossCrowns bossTypeNum={bossTypeNum} />
            </Flex>
          </Flex>
        )}
        {connected ? (
          <Text fontSize="lg">{BOSS_TYPES[bossTypeNum]} Boss Encounter</Text>
        ) : (
          <Text fontSize="xx-large" mb="20px" color="white">
            Not connected
          </Text>
        )}
        {connected && (
          <Grid>
            <GridItem>
              <Progress
                value={bossPercentInverse()}
                colorScheme="red"
                w="100%"
                my="24px"
              />
            </GridItem>
          </Grid>
        )}
        <Text fontSize="md" fontWeight="bold" color={connected ? '' : 'gray'}>
          Round Earnings:
        </Text>
        <Text color={connected ? '' : 'gray'}>
          <Text as="span" fontSize="md" color={connected ? 'white' : 'gray'}>
            {(bossCfti - nextCfti).toFixed(3)}
          </Text>{' '}
          of{' '}
          <Text as="span" color={connected ? 'white' : 'gray'} fontSize="md">
            {bossCfti.toFixed(3)}
          </Text>{' '}
          CFTI
        </Text>
        <Text fontSize="md" fontWeight="bold" color={connected ? '' : 'gray'}>
          Per Block:
        </Text>
        <Text color={connected ? '' : 'gray'}>
          <Text as="span" fontSize="md" color={connected ? 'white' : 'gray'}>
            {connected && (bossCfti / bossMaxHealth).toFixed(4)}
          </Text>{' '}
          CFTI
        </Text>
        <Text fontSize="md" fontWeight="bold" color={connected ? '' : 'gray'}>
          Time Left:
        </Text>
        <Text>
          <Text as="span" fontSize="md" color={connected ? 'white' : 'gray'}>
            {timeLeft(counter)}
          </Text>
        </Text>
      </Box>
      {connected && (
        <Flex justify="space-between">
          <Flex>
            <Img h="27px" mt="3px" src="/dmg.png" pr="10px" />
            <Text>{raidDmg}</Text>
          </Flex>
          <Flex>
            <Img h="27px" mt="6px" src="/cfti.png" pr="10px" />
            <Tooltip
              bg="purple.300"
              color="white"
              placement="top"
              hasArrow
              label={
                <>
                  <Text>Unclaimed: {unclaimedBalance.toFixed(3)}</Text>
                  <Text>Balance: {tokenBalance.toFixed(3)}</Text>
                </>
              }
            >
              <Text>{unclaimedBalance.toFixed(3)}</Text>
            </Tooltip>
          </Flex>
        </Flex>
      )}
    </BannerBox>
  )
}

export default Status
