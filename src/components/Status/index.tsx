import {
  Text,
  Button,
  Box,
  Img,
  Flex,
  Progress,
  Grid,
  GridItem,
} from '@chakra-ui/react'
import BannerBox from '../Global/BannerBox'

import { BOSS_TYPES } from '../../constants'

type StatusProps = {
  bossTypeNum?: any
  bossHealth: any
  bossMaxHealth: any
  raidDmg: any
  multiplier: any
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
  return (blocks * multiplier * DPB) / 10 ** 18
}

export default ({
  bossTypeNum,
  bossHealth,
  bossMaxHealth,
  raidDmg,
  multiplier,
}: StatusProps) => {
  const BossCrowns = ({ bossTypeNum }: { bossTypeNum?: any }) => {
    if (bossTypeNum) {
      const crowns = [...Array(bossTypeNum + 1)].map(
        (value: undefined, index: number) => {
          return <Img key={index} src="/boss-crown-small.png" />
        }
      )

      return <Flex h="32px">{crowns}</Flex>
    } else {
      return (
        <Flex h="32px">
          <Img src="/boss-crown-small.png" />
        </Flex>
      )
    }
  }

  const bossPercent = () => {
    return (bossHealth / bossMaxHealth) * 100
  }

  const bossPercentInverse = () => {
    return (bossPercent() - 100) / -1
  }
  // bossCfti={calculateCFTI({
  //   blocks: raidData?.maxHealth,
  //   multiplier: Number(raidBoss?.multiplier),
  //   DPB: raidDmg,
  // })}
  // nextCfti={calculateCFTI({
  //   blocks: raidData?.health,
  //   multiplier: Number(raidBoss?.multiplier),
  //   DPB: raidDmg,
  // })}
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
        <Flex justify="center">
          <BossCrowns bossTypeNum={bossTypeNum} />
        </Flex>
        <Text fontSize="lg">{BOSS_TYPES[bossTypeNum]} Boss Encounter</Text>
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
        <Text fontSize="md" fontWeight="bold">
          Round Earnings:
        </Text>
        <Text>
          <Text as="span" color="white" fontSize="md">
            {(bossCfti - nextCfti).toFixed(3)}
          </Text>{' '}
          of{' '}
          <Text as="span" color="white" fontSize="md">
            {bossCfti.toFixed(3)}
          </Text>{' '}
          CFTI
        </Text>
        <Text fontSize="md" fontWeight="bold">
          Per Block:
        </Text>
        <Text>
          <Text as="span" color="white" fontSize="md">
            {(bossCfti / bossMaxHealth).toFixed(4)}
          </Text>{' '}
          CFTI
        </Text>
        <Text fontSize="md" fontWeight="bold">
          Current DPB:
        </Text>
        <Text>
          <Text as="span" color="white" fontSize="md">
            {raidDmg}
          </Text>{' '}
        </Text>
      </Box>
    </BannerBox>
  )
}
