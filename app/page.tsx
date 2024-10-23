"use client"

import { useState, useEffect, useRef } from 'react'
import { ethers } from 'ethers'
import { Web3ReactProvider, useWeb3React, initializeConnector } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Shield } from 'lucide-react'

const mockAssets = [
  { name: 'USDT', balance: '1000', type: 'トークン', value: 1000 },
  { name: 'USDC', balance: '100', type: 'トークン', value: 100 },
  { name: 'stETH', balance: '2', type: 'トークン', value: 5000 },
  { name: 'wETH', balance: '1.5', type: 'トークン', value: 4900 },
  { name: 'BAYC', balance: '1', type: 'NFT', value: 0 },
  { name: 'MAYC', balance: '1', type: 'NFT', value: 0 },
]

// モジュールレベルでコネクタを初期化
const [metamask, hooks] = initializeConnector<MetaMask>((actions) => new MetaMask({ actions }))
const connectors = [[metamask, hooks]]

function WalletStatus() {
  const { connector, isActive, account, provider, ENSName, activate, deactivate } = useWeb3React()
  const [assets, setAssets] = useState(mockAssets)
  const [totalValue, setTotalValue] = useState(0)
  const [selectedAssets, setSelectedAssets] = useState<number[]>([])

  useEffect(() => {
    if (assets && assets.length > 0) {
      const total = assets.reduce((sum, asset) => sum + asset.value, 0)
      setTotalValue(total)
    }
  }, [assets])

  async function connect() {
    try {
      await activate(metamask)
    } catch (ex) {
      console.log(ex)
    }
  }

  async function disconnect() {
    try {
      await deactivate()
    } catch (ex) {
      console.log(ex)
    }
  }

  const proofFileRef = useRef<HTMLInputElement>(null)
  const fileNameRef = useRef<HTMLSpanElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (fileNameRef.current) {
        fileNameRef.current.textContent = file.name;
      }
      console.log("Selected file:", file);
    } else {
      if (fileNameRef.current) {
        fileNameRef.current.textContent = 'ファイルが選択されていません';
      }
    }
  };

  const dummyWalletAddress = account || "0x1234...5678";

  // 個別資産の選択・解除
  const handleAssetSelect = (index: number) => {
    setSelectedAssets(prevSelected => {
      if (prevSelected.includes(index)) {
        return prevSelected.filter(i => i !== index);
      } else {
        return [...prevSelected, index];
      }
    });
  };

  // 一括選択・解除
  const allSelected = selectedAssets.length === assets.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(assets.map((_, index) => index));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          管理用画面(ZK)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Button onClick={connect}>
              {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'ウォレット接続'}
            </Button>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>ZK</span>
            </div>
          </div>

          <div className="text-2xl font-bold">
            相続可能総額: ${totalValue.toLocaleString()}
          </div>
          <div className="text-lg">
            ウォレットアドレス: {account || dummyWalletAddress}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>資産</TableHead>
                <TableHead>種別</TableHead>
                <TableHead>残高</TableHead>
                <TableHead>価値</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedAssets.includes(index)}
                      onChange={() => handleAssetSelect(index)}
                    />
                  </TableCell>
                  <TableCell>{asset.name}</TableCell>
                  <TableCell>{asset.type}</TableCell>
                  <TableCell>{asset.balance}</TableCell>
                  <TableCell>${asset.value.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <h3 className="text-lg font-semibold mb-2">事前に秘密情報を用意してください。</h3>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                id="proofFile"
                ref={proofFileRef}
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                onClick={() => proofFileRef.current?.click()}
              >
                ZKproofを生成
              </Button>
              <span id="fileName" ref={fileNameRef} className="text-sm text-gray-600">ファイルが選択されていません</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Component() {
  return (
    <Web3ReactProvider connectors={connectors}>
      <WalletStatus />
    </Web3ReactProvider>
  )
}
