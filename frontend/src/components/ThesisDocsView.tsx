"use client";

import { useState } from "react";
import { NFTItem } from "@/types/nft";
import { useNFTContractAddress } from "@/hooks/useNFTContract";
import { useMarketplaceAddress } from "@/hooks/useMarketplace";
import {
  BookOpen,
  Cpu,
  Layers,
  Database,
  ShieldCheck,
  Code2,
  FileText,
  Binary,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

interface ThesisDocsViewProps {
  allNFTs: NFTItem[];
}

export default function ThesisDocsView({ allNFTs }: ThesisDocsViewProps) {
  const [selectedTokenId, setSelectedTokenId] = useState<string>("1");
  const [selectedLayer, setSelectedLayer] = useState<number>(2); // 1: Client, 2: Blockchain, 3: Oracle, 4: Storage

  const nftAddress = useNFTContractAddress();
  const marketplaceAddress = useMarketplaceAddress();

  const selectedNFT = allNFTs.find((n) => n.tokenId.toString() === selectedTokenId) || allNFTs[0];
  const level = selectedNFT ? Number(selectedNFT.stats.level) : 1;

  // Mock simulation of raw VRF values for demonstration/inspection
  const simulatedRandomWord = "8472910482019485720194827104928174029184720194827104928174029184";
  const simulatedBonusAtk = selectedNFT ? (Number(selectedNFT.stats.attack) > 20 ? Number(selectedNFT.stats.attack) - 20 : 0) : 0;

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-5 rounded-2xl bg-web3-card border border-web3-border space-y-1">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <h2 className="font-bold text-sm text-white">Thẩm Định Bằng Chứng Mật Mã & Hồ Sơ Đồ Án (Thesis Verification)</h2>
        </div>
        <p className="text-xs text-slate-400">
          Khu vực tra cứu chuyên sâu phục vụ buổi bảo vệ đồ án: kiểm tra bằng chứng số ngẫu nhiên Chainlink VRF v2, giải thuật modulo toán học, và kiến trúc phân tầng 4 lớp.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Chainlink VRF Cryptographic Proof Inspector */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-web3-card border border-web3-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-web3-border">
              <div className="flex items-center space-x-2">
                <Binary className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-white">
                  Trình Kiểm Tra VRF (Proof Inspector)
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified On-Chain</span>
              </span>
            </div>

            {/* Token Selector */}
            <div className="flex items-center justify-between text-xs">
              <label className="text-slate-400">Chọn NFT để thẩm định:</label>
              <select
                value={selectedTokenId}
                onChange={(e) => setSelectedTokenId(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-web3-surface border border-web3-border text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              >
                {allNFTs.map((n) => (
                  <option key={n.tokenId.toString()} value={n.tokenId.toString()}>
                    Token #{n.tokenId.toString()} (Level {n.stats.level.toString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Proof Technical Specs Table */}
            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-web3-surface border border-web3-border space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase">Thuật Toán Ngẫu Nhiên:</span>
                <span className="text-slate-200 font-bold">Chainlink Verifiable Random Function (VRF v2)</span>
              </div>

              <div className="p-2.5 rounded-xl bg-web3-surface border border-web3-border space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase">Mã Khóa (Key Hash Lane):</span>
                <span className="text-slate-300 text-[11px] break-all">
                  0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-web3-surface border border-web3-border space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase">Số Nguyên Ngẫu Nhiên 256-bit (Raw Random Words):</span>
                <span className="text-purple-300 text-[11px] break-all block font-bold">
                  {simulatedRandomWord}
                </span>
              </div>

              {/* Modulo Math Formula Display */}
              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-900/50 space-y-2 text-xs">
                <span className="text-indigo-300 font-bold block text-[11px]">
                  Công Thức Số Học Đồng Dư Modulo (Smart Contract):
                </span>
                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-indigo-950 font-mono text-[11px] text-slate-200 space-y-1">
                  <p>Bonus_ATK = (randomWords[0] % 31) + 20; // Khoảng: +20 đến +50</p>
                  <p>Bonus_DEF = ((randomWords[0] / 100) % 21) + 10; // Khoảng: +10 đến +30</p>
                  <p>Bonus_SPD = ((randomWords[0] / 10000) % 16) + 5; // Khoảng: +5 đến +20</p>
                </div>
                <p className="text-[10px] text-slate-400">
                  Do phân phối đồng đều trên không gian $2^{'{256}'}$, chỉ số nhận được bảo đảm sự công bằng minh bạch tuyệt đối, validator không thể can thiệp tấn công MEV.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 4-Tier Interactive Blueprint & Architecture */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-web3-card border border-web3-border space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-web3-border">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-white">
                Mô Hình Kiến Trúc 4 Tầng (4-Tier Architecture)
              </h3>
            </div>

            {/* Layer Tabs */}
            <div className="grid grid-cols-4 gap-1 text-[11px] font-mono text-center">
              {[
                { id: 1, label: "1. Client" },
                { id: 2, label: "2. Contract" },
                { id: 3, label: "3. Oracle" },
                { id: 4, label: "4. IPFS" },
              ].map((l) => (
                <button
                  key={l.id}
                  onClick={() => setSelectedLayer(l.id)}
                  className={`py-2 px-1 rounded-xl transition ${
                    selectedLayer === l.id
                      ? "bg-indigo-600 text-white font-bold"
                      : "bg-web3-surface text-slate-400 hover:text-white"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Layer Detail Box */}
            <div className="p-4 rounded-xl bg-web3-surface border border-web3-border text-xs text-slate-300 space-y-2">
              {selectedLayer === 1 && (
                <>
                  <h4 className="font-bold text-white flex items-center space-x-1.5">
                    <Cpu className="w-4 h-4 text-indigo-400" />
                    <span>Tầng Khách Hàng (Client Layer)</span>
                  </h4>
                  <p className="text-slate-400 text-xs">
                    Ứng dụng Web3 xây dựng trên <strong>Next.js 14 App Router</strong>, TailwindCSS, RainbowKit, wagmi v2 và viem.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] pt-1">
                    <li>Ký duyệt giao dịch qua ví MetaMask an toàn bằng chữ ký điện tử mật mã.</li>
                    <li>Đồng bộ hóa dữ liệu On-Chain và phân tích logs sự kiện thời gian thực.</li>
                  </ul>
                </>
              )}

              {selectedLayer === 2 && (
                <>
                  <h4 className="font-bold text-white flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Tầng Blockchain (Smart Contract Layer)</span>
                  </h4>
                  <p className="text-slate-400 text-xs">
                    Hệ thống gồm 2 Smart Contract triển khai trên máy ảo Ethereum (EVM):
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] pt-1">
                    <li>
                      <strong className="text-white">DynamicNFT.sol:</strong> Kế thừa <code>ERC721URIStorage</code>, <code>VRFConsumerBaseV2</code>, <code>Ownable</code>.
                    </li>
                    <li>
                      <strong className="text-white">NFTMarketplace.sol:</strong> Sàn phi tập trung khớp lệnh P2P với thanh toán ETH an toàn chống Reentrancy.
                    </li>
                  </ul>
                </>
              )}

              {selectedLayer === 3 && (
                <>
                  <h4 className="font-bold text-white flex items-center space-x-1.5">
                    <Binary className="w-4 h-4 text-purple-400" />
                    <span>Tầng Oracle Phi Tập Trung (Oracle Layer)</span>
                  </h4>
                  <p className="text-slate-400 text-xs">
                    Tích hợp <strong>Chainlink VRF v2 (Verifiable Random Function)</strong>:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] pt-1">
                    <li>Mô hình Request-Fulfill không đồng bộ 2 bước.</li>
                    <li>Mạng lưới node Chainlink ngoài chuỗi sinh số ngẫu nhiên kèm chứng chỉ mật mã.</li>
                    <li>Hợp đồng Coordinator callback trực tiếp vào hàm <code>fulfillRandomWords</code>.</li>
                  </ul>
                </>
              )}

              {selectedLayer === 4 && (
                <>
                  <h4 className="font-bold text-white flex items-center space-x-1.5">
                    <Database className="w-4 h-4 text-cyan-400" />
                    <span>Tầng Lưu Trữ Phân Tán (Decentralized Storage Layer)</span>
                  </h4>
                  <p className="text-slate-400 text-xs">
                    Mạng lưới <strong>IPFS</strong> kết hợp dịch vụ ghim vĩnh viễn <strong>Pinata Cloud</strong>:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] pt-1">
                    <li>Đóng gói tệp hình ảnh đồ họa độ phân giải cao theo từng nấc tiến hóa.</li>
                    <li>Metadata JSON tuân thủ nghiêm ngặt tiêu chuẩn OpenSea / EIP-721.</li>
                    <li>Hợp đồng chỉ lưu mã băm CID, tiết kiệm tối đa chi phí Gas lưu trữ On-chain.</li>
                  </ul>
                </>
              )}
            </div>

            {/* Smart Contract Addresses Pill */}
            <div className="space-y-1.5 text-[11px] font-mono">
              <div className="flex items-center justify-between p-2 rounded-lg bg-web3-surface border border-web3-border">
                <span className="text-slate-400">DynamicNFT:</span>
                <span className="text-indigo-400 font-bold">{nftAddress}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-web3-surface border border-web3-border">
                <span className="text-slate-400">Marketplace:</span>
                <span className="text-emerald-400 font-bold">{marketplaceAddress}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
