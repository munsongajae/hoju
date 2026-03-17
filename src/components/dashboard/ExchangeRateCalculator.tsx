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
  { code: "JPY", name: "일본 엔", flag: "🇯🇵" },
  { code: "EUR", name: "유로", flag: "🇪🇺" },
  { code: "CNY", name: "중국 위안", flag: "🇨🇳" },
  { code: "HKD", name: "홍콩 달러", flag: "🇭🇰" },
  { code: "TWD", name: "대만 신타이완달러", flag: "🇹🇼" },
  { code: "SGD", name: "싱가포르 달러", flag: "🇸🇬" },
  { code: "THB", name: "태국 바트", flag: "🇹🇭" },
  { code: "IDR", name: "인도네시아 루피아", flag: "🇮🇩" },
  { code: "PHP", name: "필리핀 페소", flag: "🇵🇭" },
  { code: "MYR", name: "말레이시아 링깃", flag: "🇲🇾" },
  { code: "INR", name: "인도 루피", flag: "🇮🇳" },
  { code: "PKR", name: "파키스탄 루피", flag: "🇵🇰" },
  { code: "BDT", name: "방글라데시 타카", flag: "🇧🇩" },
  { code: "AED", name: "아랍에미리트 디르함", flag: "🇦🇪" },
  { code: "SAR", name: "사우디아라비아 리얄", flag: "🇸🇦" },
  { code: "QAR", name: "카타르 리얄", flag: "🇶🇦" },
  { code: "KWD", name: "쿠웨이트 디나르", flag: "🇰🇼" },
  { code: "IRR", name: "이란 리알", flag: "🇮🇷" },
  { code: "ILS", name: "이스라엘 셰켈", flag: "🇮🇱" },
  { code: "TRY", name: "터키 리라", flag: "🇹🇷" },
  { code: "GBP", name: "영국 파운드", flag: "🇬🇧" },
  { code: "CHF", name: "스위스 프랑", flag: "🇨🇭" },
  { code: "SEK", name: "스웨덴 크로나", flag: "🇸🇪" },
  { code: "NOK", name: "노르웨이 크로네", flag: "🇳🇴" },
  { code: "DKK", name: "덴마크 크로네", flag: "🇩🇰" },
  { code: "PLN", name: "폴란드 즈워티", flag: "🇵🇱" },
  { code: "CZK", name: "체코 코루나", flag: "🇨🇿" },
  { code: "HUF", name: "헝가리 포린트", flag: "🇭🇺" },
  { code: "RUB", name: "러시아 루블", flag: "🇷🇺" },
  { code: "RON", name: "루마니아 레우", flag: "🇷🇴" },
  { code: "BGN", name: "불가리아 레프", flag: "🇧🇬" },
  { code: "CAD", name: "캐나다 달러", flag: "🇨🇦" },
  { code: "MXN", name: "멕시코 페소", flag: "🇲🇽" },
  { code: "CUP", name: "쿠바 페소", flag: "🇨🇺" },
  { code: "BRL", name: "브라질 헤알", flag: "🇧🇷" },
  { code: "ARS", name: "아르헨티나 페소", flag: "🇦🇷" },
  { code: "CLP", name: "칠레 페소", flag: "🇨🇱" },
  { code: "COP", name: "콜롬비아 페소", flag: "🇨🇴" },
  { code: "PEN", name: "페루 솔", flag: "🇵🇪" },
  { code: "VES", name: "베네수엘라 볼리바르", flag: "🇻🇪" },
  { code: "ZAR", name: "남아공 랜드", flag: "🇿🇦" },
  { code: "EGP", name: "이집트 파운드", flag: "🇪🇬" },
  { code: "NGN", name: "나이지리아 나이라", flag: "🇳🇬" },
  { code: "KES", name: "케냐 실링", flag: "🇰🇪" },
  { code: "MAD", name: "모로코 디르함", flag: "🇲🇦" },
  { code: "GHS", name: "가나 세디", flag: "🇬🇭" },
  { code: "NZD", name: "뉴질랜드 달러", flag: "🇳🇿" }
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




