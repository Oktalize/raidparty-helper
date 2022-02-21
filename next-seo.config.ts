export const title = 'Raid Party Beta Helper'
const description = 'Raid Party Beta Helper is made to assist players on Rinkeby testnet only.'
const url = 'https://raid.party'

const SEO = {
  title,
  description,
  canonical: url,
  openGraph: {
    type: 'website',
    url,
    title,
    description,
    images: [
      {
        url: `https://raid.party/images/logo.png`,
        alt: title,
        width: 660,
        height: 190,
      },
    ],
  },
  twitter: {
    cardType: 'summary_large_image',
    handle: '@raidparty',
    site: '@raidparty',
  },
  additionalLinkTags: [{ rel: 'icon', href: '/favicon.png' }],
}

export default SEO
