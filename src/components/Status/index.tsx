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
  bossTypeNum: any
  bossCfti: any
  nextCfti: any
  bossHealth: any
  bossMaxHealth: any
  raidDmg: any
}

export default ({
  bossTypeNum,
  bossCfti,
  nextCfti,
  bossHealth,
  bossMaxHealth,
  raidDmg,
}: StatusProps) => {
  const BossCrowns = ({ bossTypeNum }: { bossTypeNum: any }) => {
    const crowns = [...Array(bossTypeNum + 1)].map(
      (value: undefined, index: number) => {
        return <Img key={index} src="/boss-crown-small.png" />
      }
    )

    return <Flex h="32px">{crowns}</Flex>
  }

  const bossPercent = () => {
    return (bossHealth / bossMaxHealth) * 100
  }

  const bossPercentInverse = () => {
    return (bossPercent() - 100) / -1
  }

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
