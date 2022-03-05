export const TOKEN_ADDRESS = {
    "CFTI": '0xcfef8857e9c80e3440a823971420f7fa5f62f020',
    "CFTIClaimer": '0xfa209a705a4da0a240aa355c889ed0995154d7eb',
    "PARTY": '0xd311bdacb151b72bddfee9cbdc414af22a5e38dc',
    "RAID": '0xfa209a705a4da0a240aa355c889ed0995154d7eb'
}

export const BOSS_TYPES = {
    1: "Basic"
}

export const TOKEN_ABI = [
    {
        constant: true,
        inputs: [],
        name: 'name',
        outputs: [
            {
                name: '',
                type: 'string'
            }
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function'
    },
    {
        constant: true,
        inputs: [],
        name: 'decimals',
        outputs: [
            {
                name: '',
                type: 'uint8'
            }
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function'
    },
    {
        constant: true,
        payable: false,
        stateMutability: 'view',
        type: 'function',
        inputs: [
            {
                name: '_owner',
                type: 'address'
            }
        ],
        name: 'balanceOf',
        outputs: [
            {
                name: 'balance',
                type: 'uint256'
            }
        ]
    },
    {
        constant: true,
        inputs: [
            {
                name: '_owner',
                type: 'address'
            }
        ],
        name: 'getPendingRewards',
        outputs: [
            {
                name: 'balance',
                type: 'uint256'
            }
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function'
    }, {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "claimRewards",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "bosses",
        "outputs": [
            {
                "internalType": "uint32",
                "name": "weight",
                "type": "uint32"
            }, {
                "internalType": "uint32",
                "name": "blockHealth",
                "type": "uint32"
            }, {
                "internalType": "uint128",
                "name": "multiplier",
                "type": "uint128"
            }
        ],
        constant: true,
        payable: false,
        stateMutability: 'view',
        type: 'function'
    }, {
        "inputs": [],
        "name": "getRaidData",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint16",
                        "name": "boss",
                        "type": "uint16"
                    },
                    {
                        "internalType": "uint32",
                        "name": "roundId",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint32",
                        "name": "health",
                        "type": "uint32"
                    },
                    {
                        "internalType": "uint32",
                        "name": "maxHealth",
                        "type": "uint32"
                    }, {
                        "internalType": "uint256",
                        "name": "seed",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct IRaid.RaidData",
                "name": "data",
                "type": "tuple"
            }
        ],
        constant: true,
        payable: false,
        stateMutability: 'view',
        type: 'function'
    }, {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "getDamage",
        "outputs": [
            {
                "internalType": "uint32",
                "name": "",
                "type": "uint32"
            }
        ],
        constant: true,
        payable: false,
        stateMutability: 'view',
        type: 'function'
    },
]

export const DefaultProviderName = 'DEFAULT'
