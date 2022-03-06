import { Text, Button, Box, Img, Flex } from '@chakra-ui/react'
import BannerBox from '../Global/BannerBox'

type ClaimProps = {
  unclaimedBalance: any
  tokenBalance: any
  pending: any
  claimTokens: any
}

export default ({
  unclaimedBalance,
  tokenBalance,
  pending,
  claimTokens,
}: ClaimProps) => {
  return (
    <BannerBox heading={'Your Earnings'}>
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
        <Text fontSize="xs">Wallet Balance: {tokenBalance.toFixed(3)}</Text>
      </Box>
      <Button disabled={pending} w="100%" onClick={claimTokens}>
        Claim
      </Button>
    </BannerBox>
  )
}
