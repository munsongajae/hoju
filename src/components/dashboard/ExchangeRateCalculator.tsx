"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeftRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CURRENCIES = [
  { code: "AUD", name: "호주 달러", flag: "🇦🇺" },
  { code: "USD", name: "미국 달러", flag: "🇺🇸" },
  { code: "VND", name: "베트남 동", flag: "🇻🇳" },
  { code: "JPY", name: "일본 엔화", flag: "🇯🇵" },
  { code: "EUR", name: "유로", flag: "🇪🇺" },
  { code: "CNY", name: "중국 위안", flag: "🇨🇳" },
  { code: "HKD", name: "홍콩 달러", flag: "🇭🇰" },
  { code: "THB", name: "태국 바트", flag: "🇹🇭" },
  { code: "GBP", name: "영국 파운드", flag: "🇬🇧" },
  { code: "NZD", name: "뉴질랜드 달러", flag: "🇳🇿" },
  { code: "CHF", name: "스위스 프랑", flag: "🇨🇭" },
  { code: "PHP", name: "필리핀 페소", flag: "🇵🇭" },
  { code: "IDR", name: "인도네시아 루피아", flag: "🇮🇩" },
  { code: "MYR", name: "말레이시아 링깃", flag: "🇲🇾" },
];

export function ExchangeRateCalculator() {
  const [fromCurrency, setFromCurrency] = useState("AUD");
  const [toCurrency, setToCurrency] = useState("KRW");
  const [amount, setAmount] = useState("1");
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 환율 조회
  const fetchRate = async (currency: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/exchange-rate?currency=${currency}`);
      if (!response.ok) {
        throw new Error("환율 조회 실패");
      }
      const data = await response.json();
      return data.rate;
    } catch (err) {
      console.error("환율 조회 오류:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 환율 로드
  useEffect(() => {
    if (fromCurrency !== "KRW") {
      // 외화 -> KRW
      fetchRate(fromCurrency)
        .then((fetchedRate) => setRate(fetchedRate))
        .catch(() => setError("환율을 불러올 수 없습니다."));
    } else if (toCurrency !== "KRW") {
      // KRW -> 외화: toCurrency의 환율 필요
      fetchRate(toCurrency)
        .then((fetchedRate) => setRate(fetchedRate))
        .catch(() => setError("환율을 불러올 수 없습니다."));
    } else {
      setRate(null);
    }
  }, [fromCurrency, toCurrency]);

  // 계산
  const calculate = () => {
    if (!amount || isNaN(Number(amount))) return null;
    if (fromCurrency === "KRW") {
      // KRW -> 외화: 1원당 외화 가치
      if (!rate) return null;
      return Number(amount) / rate;
    } else {
      // 외화 -> KRW
      if (!rate) return null;
      return Number(amount) * rate;
    }
  };

  const result = calculate();
  const fromCurrencyInfo = CURRENCIES.find((c) => c.code === fromCurrency);
  const toCurrencyInfo = toCurrency === "KRW" 
    ? { code: "KRW", name: "한국 원", flag: "🇰🇷" } 
    : CURRENCIES.find((c) => c.code === toCurrency);

  const swapCurrencies = () => {
    if (fromCurrency === "KRW") {
      // KRW에서 외화로 전환
      const firstForeign = CURRENCIES[0].code;
      setFromCurrency(firstForeign);
      setToCurrency("KRW");
    } else {
      // 외화에서 KRW로 전환
      setFromCurrency("KRW");
      setToCurrency(fromCurrency);
    }
    setAmount("1");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          💱 환율 계산기
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 환율 정보 */}
        {rate && (
          <div className="text-sm text-muted-foreground">
            {fromCurrency === "KRW" ? (
              <>
                1 {toCurrency} = {rate.toLocaleString("ko-KR", { maximumFractionDigits: 2 })} 원
              </>
            ) : (
              <>
                1 {fromCurrency} = {rate.toLocaleString("ko-KR", { maximumFractionDigits: 2 })} 원
              </>
            )}
          </div>
        )}

        {/* 입력 섹션 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="금액 입력"
                className="text-right"
              />
            </div>
            <div className="min-w-[140px]">
              <Select
                value={fromCurrency}
                onValueChange={(value) => {
                  setFromCurrency(value);
                  if (value !== "KRW") {
                    setToCurrency("KRW");
                  } else {
                    setToCurrency("AUD");
                  }
                  setAmount("1");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      {fromCurrencyInfo ? (
                        <>
                          <span className="text-lg">{fromCurrencyInfo.flag}</span>
                          <span className="text-sm font-medium">{fromCurrencyInfo.code}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-lg">🇰🇷</span>
                          <span className="text-sm font-medium">KRW</span>
                        </>
                      )}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KRW">
                    <div className="flex items-center gap-2">
                      <span>🇰🇷</span>
                      <span>KRW - 한국 원</span>
                    </div>
                  </SelectItem>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center gap-2">
                        <span>{currency.flag}</span>
                        <span>{currency.code} - {currency.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 스왑 버튼 */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={swapCurrencies}
              className="rounded-full"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </Button>
          </div>

          {/* 결과 */}
          <div className="flex items-center gap-2 p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
            <div className="flex-1 text-right">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin inline" />
              ) : error ? (
                <span className="text-sm text-destructive">{error}</span>
              ) : result !== null ? (
                <span className="text-lg font-semibold">
                  {result.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">-</span>
              )}
            </div>
            <div className="min-w-[140px]">
              <Select
                value={toCurrency}
                onValueChange={(value) => {
                  setToCurrency(value);
                  if (value !== "KRW") {
                    setFromCurrency("KRW");
                  } else if (fromCurrency === "KRW") {
                    setFromCurrency("AUD");
                  }
                  setAmount("1");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      {toCurrencyInfo ? (
                        <>
                          <span className="text-lg">{toCurrencyInfo.flag}</span>
                          <span className="text-sm font-medium">{toCurrencyInfo.code}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-lg">🇰🇷</span>
                          <span className="text-sm font-medium">KRW</span>
                        </>
                      )}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KRW">
                    <div className="flex items-center gap-2">
                      <span>🇰🇷</span>
                      <span>KRW - 한국 원</span>
                    </div>
                  </SelectItem>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center gap-2">
                        <span>{currency.flag}</span>
                        <span>{currency.code} - {currency.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
