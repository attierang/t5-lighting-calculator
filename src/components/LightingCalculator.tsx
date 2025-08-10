import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "./ui/dialog";
import { Label } from "./ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { toast } from "sonner";
import {
  projectId,
  publicAnonKey,
} from "../utils/supabase/info";
import {
  Trash2,
  Share2,
  Save,
  Edit3,
  Check,
  X,
  Copy,
} from "lucide-react";
// SupabaseTest는 조건부로만 import하여 번들 크기 최적화

interface LightingType {
  name: string;
  nominalLength: number;
  actualLength: number;
}

interface CombinationResult {
  type: string;
  quantity: number;
  usedLength: number;
}

interface OptimalCombination {
  combinations: CombinationResult[];
  totalUsedLength: number;
  remainingLength: number;
}

interface CalculationData {
  id: string;
  name?: string;
  totalLength: number;
  width?: number;
  height?: number;
  inputMode?: string;
  includePowerCord: boolean;
  combinations: OptimalCombination[];
  createdAt: string;
}

const LIGHTING_TYPES: LightingType[] = [
  { name: "1200", nominalLength: 1200, actualLength: 1160 },
  { name: "900", nominalLength: 900, actualLength: 860 },
  { name: "600", nominalLength: 600, actualLength: 560 },
  { name: "400", nominalLength: 400, actualLength: 390 },
  { name: "300", nominalLength: 300, actualLength: 300 },
  { name: "T5코드", nominalLength: 60, actualLength: 60 },
];

export function LightingCalculator() {
  const [totalLength, setTotalLength] =
    useState<string>("");
  const [width, setWidth] = useState<string>("0");
  const [height, setHeight] = useState<string>("0");
  const [inputMode, setInputMode] = useState<
    "total" | "separate"
  >("separate");
  const [includePowerCord, setIncludePowerCord] =
    useState<boolean>(true);
  const [optimalCombinations, setOptimalCombinations] =
    useState<OptimalCombination[]>([]);
  const [isCalculated, setIsCalculated] =
    useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [recentCalculations, setRecentCalculations] = useState<
    CalculationData[]
  >([]);
  const [saveDialogOpen, setSaveDialogOpen] =
    useState<boolean>(false);
  const [saveNameInput, setSaveNameInput] =
    useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(
    null,
  );
  const [editingName, setEditingName] = useState<string>("");

  // 가로/세로 길이가 변경될 때 총 길이 자동 계산
  useEffect(() => {
    if (inputMode === "separate" && width && height) {
      const widthNum = parseInt(width) || 0;
      const heightNum = parseInt(height) || 0;
      // 0이 아닐 때만 계산
      if (widthNum > 0 && heightNum > 0) {
        const perimeter = (widthNum + heightNum) * 2;
        setTotalLength(perimeter.toString());
      } else {
        setTotalLength("");
      }
    }
  }, [width, height, inputMode]);

  // 입력 모드 변경 시 초기화
  const handleInputModeChange = (
    mode: "total" | "separate",
  ) => {
    setInputMode(mode);
    setIsCalculated(false);
    setShareUrl("");
    setOptimalCombinations([]);

    if (mode === "separate") {
      // 가로/세로 모드로 변경 시 기본값 설정 (0으로 유지)
      if (!width || !height) {
        setWidth("0");
        setHeight("0");
      }
    }
  };

  // URL에서 공유 파라미터 확인
  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(
        window.location.search,
      );
      const shareId = urlParams.get("share");

      if (shareId) {
        loadSharedCalculation(shareId);
      }
    }

    loadRecentCalculations();
  }, []);

  // 공유된 계산 결과 로드
  const loadSharedCalculation = async (
    calculationId: string,
  ) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d6aea025/get-calculation/${calculationId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();

      if (result.success && result.data) {
        const {
          totalLength,
          includePowerCord,
          combinations,
          width,
          height,
        } = result.data;
        setTotalLength(totalLength.toString());
        setIncludePowerCord(includePowerCord);
        setOptimalCombinations(combinations);
        setIsCalculated(true);

        // 공유된 데이터에 가로/세로 정보가 있다면 사용
        if (width && height) {
          setWidth(width.toString());
          setHeight(height.toString());
          setInputMode("separate");
        } else {
          // 없다면 총 길이 모드로 설정
          setInputMode("total");
        }

        toast.success("공유된 계산 결과를 불러왔습니다!");
      } else {
        toast.error("계산 결과를 불러올 수 없습니다.");
      }
    } catch (error) {
      console.error("Error loading shared calculation:", error);
      toast.error(
        "계산 결과를 불러오는 중 오류가 발생했습니다.",
      );
    }
  };

  // 최근 계산 결과 목록 로드
  const loadRecentCalculations = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d6aea025/recent-calculations`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();

      if (result.success && result.data) {
        setRecentCalculations(result.data);
      }
    } catch (error) {
      console.error(
        "Error loading recent calculations:",
        error,
      );
    }
  };

  // 저장 다이얼로그 열기
  const openSaveDialog = () => {
    if (!isCalculated || optimalCombinations.length === 0) {
      toast.error(
        "계산 결과가 없습니다. 먼저 계산을 수행해주세요.",
      );
      return;
    }

    // 기본 이름 생성
    const defaultName =
      inputMode === "separate" && width && height
        ? `${width}×${height}mm (${totalLength}mm)`
        : `${totalLength}mm`;

    setSaveNameInput(defaultName);
    setSaveDialogOpen(true);
  };

  // 계산 결과 저장 및 공유 URL 생성
  const saveCalculation = async () => {
    if (!saveNameInput.trim()) {
      toast.error("저장할 이름을 입력해주세요.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d6aea025/save-calculation`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: saveNameInput.trim(),
            totalLength: parseInt(totalLength),
            width:
              inputMode === "separate" ? parseInt(width) : null,
            height:
              inputMode === "separate"
                ? parseInt(height)
                : null,
            inputMode,
            includePowerCord,
            combinations: optimalCombinations,
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        if (typeof window !== "undefined") {
          const fullShareUrl = `${window.location.origin}${window.location.pathname}?share=${result.calculationId}`;
          setShareUrl(fullShareUrl);
        }
        toast.success("계산 결과가 저장되었습니다!");
        setSaveDialogOpen(false);
        setSaveNameInput("");
        loadRecentCalculations(); // 목록 새로고침
      } else {
        toast.error("저장 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Error saving calculation:", error);
      toast.error("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 공유 URL 복사
  const copyShareUrl = () => {
    if (
      shareUrl &&
      typeof navigator !== "undefined" &&
      navigator.clipboard
    ) {
      navigator.clipboard.writeText(shareUrl);
      toast.success("공유 링크가 복사되었습니다!");
    }
  };

  // 계산 결과 삭제
  const deleteCalculation = async (calculationId: string) => {
    if (!confirm("이 계산 결과를 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d6aea025/delete-calculation/${calculationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();

      if (result.success) {
        toast.success("계산 결과가 삭제되었습니다.");
        loadRecentCalculations(); // 목록 새로고침
      } else {
        toast.error("삭제 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Error deleting calculation:", error);
      toast.error("삭제 중 오류가 발생했습니다.");
    }
  };

  // 이름 편집 시작
  const startEditing = (
    calculationId: string,
    currentName: string,
  ) => {
    setEditingId(calculationId);
    setEditingName(currentName);
  };

  // 이름 편집 취소
  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  // 이름 업데이트
  const updateCalculationName = async (
    calculationId: string,
  ) => {
    if (!editingName.trim()) {
      toast.error("이름을 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d6aea025/update-calculation-name/${calculationId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editingName.trim(),
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        toast.success("이름이 업데이트되었습니다.");
        setEditingId(null);
        setEditingName("");
        loadRecentCalculations(); // 목록 새로고침
      } else {
        toast.error("업데이트 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Error updating calculation name:", error);
      toast.error("업데이트 중 오류가 발생했습니다.");
    }
  };

  const calculateOptimalCombinations = () => {
    const target = parseInt(totalLength);
    if (target <= 0) {
      toast.error("유효한 길이를 입력해주세요.");
      return;
    }

    const allCombinations: OptimalCombination[] = [];

    // T5코드는 전원코드 포함 시 1개 고정, 그 외엔 없음
    const t5Quantity = includePowerCord ? 1 : 0;
    const t5UsedLength = t5Quantity * 60;
    const remainingAfterT5 = target - t5UsedLength;

    if (remainingAfterT5 < 0) return;

    // T5코드를 제외한 나머지 조명으로 조합 계산 (T5코드 제외)
    const lightingTypesExceptT5 = LIGHTING_TYPES.slice(0, -1);

    // 동적 프로그래밍을 사용하여 모든 가능한 조합 계산
    const generateCombinations = (
      remaining: number,
      currentCombination: CombinationResult[],
      typeIndex: number = 0,
    ) => {
      if (typeIndex >= lightingTypesExceptT5.length) {
        // 모든 조명 타입을 처리했을 때
        const totalUsed =
          currentCombination.reduce(
            (sum, item) => sum + item.usedLength,
            0,
          ) + t5UsedLength;
        const remainingLength = target - totalUsed;

        const finalCombination = [...currentCombination];
        if (t5Quantity > 0) {
          finalCombination.push({
            type: "T5코드",
            quantity: t5Quantity,
            usedLength: t5UsedLength,
          });
        }

        allCombinations.push({
          combinations: finalCombination.filter(
            (item) => item.quantity > 0,
          ),
          totalUsedLength: totalUsed,
          remainingLength: remainingLength,
        });
        return;
      }

      const lightType = lightingTypesExceptT5[typeIndex];
      const maxQuantity = Math.floor(
        remaining / lightType.actualLength,
      );

      for (
        let quantity = 0;
        quantity <= maxQuantity;
        quantity++
      ) {
        const usedLength = quantity * lightType.actualLength;
        const newCombination = [...currentCombination];

        if (quantity > 0) {
          newCombination.push({
            type: lightType.name,
            quantity,
            usedLength,
          });
        }

        generateCombinations(
          remaining - usedLength,
          newCombination,
          typeIndex + 1,
        );
      }
    };

    generateCombinations(remainingAfterT5, []);

    // 남는 길이가 적은 순으로 정렬하고 상위 3개 선택
    allCombinations.sort(
      (a, b) => a.remainingLength - b.remainingLength,
    );
    const topCombinations = allCombinations.slice(0, 3);

    setOptimalCombinations(topCombinations);
    setIsCalculated(true);
  };

  const renderCombinationTable = (
    combination: OptimalCombination,
    index: number,
  ) => {
    const fullCombination = combination.combinations.flatMap((item) => {
      const lightingType = LIGHTING_TYPES.find((type) => type.name === item.type);
      return Array(item.quantity).fill({
        ...item,
        nominalLength: lightingType?.nominalLength || 0,
        actualLength: lightingType?.actualLength || 0,
      });
    });

    const calculatedTotalUsedLength = fullCombination.reduce(
      (sum, item) => sum + item.usedLength,
      0,
    );
    const calculatedRemainingLength = combination.remainingLength;

    return (
      <Card key={index} className="mb-[10px]">
        <CardContent className="pt-[10px] pb-[10px]">
          <div className="mb-[5px]">
            <span className="text-base font-medium">
              # 조합{index + 1}
            </span>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100 h-8">
                  <TableHead className="text-center text-xs py-1 text-[13px] min-w-[80px]">
                    종류
                  </TableHead>
                  <TableHead className="text-center text-xs py-1 text-[14px] min-w-[60px]">
                    수량
                  </TableHead>
                  <TableHead className="text-center text-xs py-1 text-[14px] min-w-[80px]">
                    사용 길이
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fullCombination.map((item, idx) => (
                  <TableRow key={idx} className="h-8">
                    <TableCell className="text-center text-xs py-1 text-[14px]">
                      {item.type === "T5코드"
                        ? `${item.type} (${item.actualLength})`
                        : `${item.nominalLength} (${item.actualLength})`}
                    </TableCell>
                    <TableCell className="text-center text-xs py-1 text-[14px]">
                      {item.quantity}개
                    </TableCell>
                    <TableCell className="text-center text-xs py-1 text-[14px]">
                      {item.usedLength}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-gray-50 h-8">
                  <TableCell className="text-center text-xs py-1 text-[14px] font-bold">
                    총 사용 길이
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-center text-xs py-1 text-[14px] font-bold">
                    {calculatedTotalUsedLength}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="mt-[5px]">
            <p className="text-sm mt-[10px] mr-[0px] mb-[0px] ml-[0px] text-[12px] font-normal text-right">
              (남는 길이: {calculatedRemainingLength}mm)
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-[10px] space-y-[10px]">
      <h1 className="text-xl sm:text-2xl mb-[10px] text-left font-bold mt-[20px] mr-[0px] ml-[0px]">
        T5 조명길이 계산기
      </h1>

      {/* 개발 모드에서만 테스트 컴포넌트 표시 */}
      {typeof window !== "undefined" &&
        window.location.search.includes("debug=true") && (
          <div className="mb-[10px] p-[10px] bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-700">
              🔧 개발 모드: URL에서 debug=true 감지됨
            </p>
          </div>
        )}

      {/* 입력 모드 선택 */}
      <Card className="mb-[10px]">
        <CardContent className="py-[20px] px-[10px] p-[20px]">
          <div className="flex gap-2 sm:gap-4 mb-[10px]">
            <Button
              variant={
                inputMode === "separate" ? "default" : "outline"
              }
              onClick={() => handleInputModeChange("separate")}
              size="sm"
              className="text-[12px] sm:text-sm h-8 sm:h-7 px-2 sm:px-3 flex-1 sm:flex-none"
            >
              가로/세로 입력
            </Button>
            <Button
              variant={
                inputMode === "total" ? "default" : "outline"
              }
              onClick={() => handleInputModeChange("total")}
              size="sm"
              className="text-[12px] sm:text-sm h-8 sm:h-7 px-2 sm:px-3 flex-1 sm:flex-none"
            >
              총 길이 입력
            </Button>
          </div>

          {inputMode === "separate" ? (
            <div className="space-y-[10px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm mb-[5px] block text-[12px] sm:text-sm">
                    가로 길이 (mm)
                  </label>
                  <Input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    placeholder="가로 길이"
                    className="h-10 sm:h-8 text-base sm:text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm mb-[5px] block text-[12px] sm:text-sm">
                    세로 길이 (mm)
                  </label>
                  <Input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="세로 길이"
                    className="h-10 sm:h-8 text-base sm:text-sm"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600">
                <strong>총 둘레:</strong> {totalLength}mm (가로{" "}
                {width} + 세로 {height}) × 2
              </p>
            </div>
          ) : (
            <div>
              <label className="text-sm mb-[5px] block">
                총 길이 (mm)
              </label>
              <Input
                type="number"
                value={totalLength}
                onChange={(e) => setTotalLength(e.target.value)}
                placeholder="총 길이를 입력하세요"
                className="w-full h-10 sm:h-8 text-base sm:text-sm"
              />
            </div>
          )}

          <div className="flex items-center space-x-2 mt-[10px]">
            <Checkbox
              id="powerCord"
              checked={includePowerCord}
              onCheckedChange={(checked) =>
                setIncludePowerCord(checked as boolean)
              }
              className="h-5 w-5 sm:h-4 sm:w-4"
            />
            <label htmlFor="powerCord" className="text-sm">
              전원코드 포함(60mm)
            </label>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={calculateOptimalCombinations}
        variant="outline"
        className="w-full bg-[rgba(0,0,0,1)] text-[rgba(255,255,255,1)] border-gray-300 hover:bg-[rgba(0,0,0,1)] hover:text-[rgba(255,255,255,1)] font-normal text-[14px] sm:text-[14px] px-4 py-3 sm:py-2 rounded-[50px] h-12 sm:h-9 px-[14px] py-[20px] sm:px-[14px] sm:py-[20px]"
        size="sm"
      >
        계산
      </Button>

      {isCalculated && optimalCombinations.length > 0 && (
        <div className="mt-[10px]">
          {optimalCombinations.map((combination, index) =>
            renderCombinationTable(combination, index),
          )}

          <div className="mt-[10px] flex flex-col gap-[10px]">
            <div className="flex gap-2 justify-center">
              <Dialog
                open={saveDialogOpen}
                onOpenChange={setSaveDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    onClick={openSaveDialog}
                    variant="outline"
                    className="bg-[rgba(0,0,0,1)] text-[rgba(255,255,255,1)] border-gray-300 hover:bg-gray-50 h-10 sm:h-8 px-4 text-sm rounded-[30px] py-[20px] px-[14px] p-[20px] m-[0px] px-[50px] py-[20px] text-[14px] flex-1 sm:flex-none"
                    size="sm"
                  >
                    결과저장
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md w-[95vw] max-w-[95vw]">
                  <DialogHeader>
                    <DialogTitle>계산 결과 저장</DialogTitle>
                    <DialogDescription>
                      계산 결과를 저장하고 공유 링크를
                      생성합니다.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">
                        저장 이름
                      </label>
                      <Input
                        value={saveNameInput}
                        onChange={(e) =>
                          setSaveNameInput(e.target.value)
                        }
                        placeholder="계산 결과 이름을 입력하세요"
                        className="mt-1 h-10 sm:h-8"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setSaveDialogOpen(false)}
                        disabled={isSaving}
                        className="h-10 sm:h-8"
                      >
                        취소
                      </Button>
                      <Button
                        onClick={saveCalculation}
                        disabled={
                          isSaving || !saveNameInput.trim()
                        }
                        variant="outline"
                        className="bg-white text-black border-gray-300 hover:bg-gray-50 h-10 sm:h-8"
                      >
                        {isSaving ? "저장 중..." : "저장"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {shareUrl && (
              <div className="p-[10px] bg-gray-50 rounded-lg border border-gray-200">
                <p
                  className="text-sm mb-[10px]"
                  style={{ color: "#333333" }}
                >
                  🔗 공유 링크가 생성되었습니다:
                </p>
                <div className="flex gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="text-sm h-10 sm:h-8 flex-1"
                  />
                  <Button
                    onClick={copyShareUrl}
                    size="sm"
                    variant="outline"
                    className="bg-white text-black border-gray-300 hover:bg-gray-50 h-10 sm:h-8 px-3 sm:px-2 flex-shrink-0"
                  >
                    <Copy className="w-4 h-4 sm:w-3 sm:h-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ marginTop: '50px' }}>
        <h2 className="text-lg sm:text-xl mb-[10px]">최근 계산 결과</h2>
        {recentCalculations.length > 0 ? (
          <Accordion
            type="multiple"
            className="w-full space-y-[10px]"
          >
            {recentCalculations
              .slice(0, 5)
              .map((calc, index) => (
                <AccordionItem
                  key={calc.id}
                  value={calc.id}
                  className="border border-gray-200 rounded-lg"
                >
                  <div className="p-[10px] space-y-[10px]">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        {editingId === calc.id ? (
                          <div className="flex items-center gap-2 min-h-[24px] mb-[5px]">
                            <Input
                              value={editingName}
                              onChange={(e) =>
                                setEditingName(e.target.value)
                              }
                              className="flex-1 h-8 sm:h-6 text-sm"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  updateCalculationName(
                                    calc.id,
                                  );
                                } else if (e.key === "Escape") {
                                  cancelEditing();
                                }
                              }}
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={() =>
                                updateCalculationName(calc.id)
                              }
                              variant="outline"
                              className="bg-white text-black border-gray-300 hover:bg-gray-50 h-8 sm:h-6 px-2 sm:px-1 flex-shrink-0"
                            >
                              <Check className="w-4 h-4 sm:w-3 sm:h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEditing}
                              className="bg-white text-black border-gray-300 hover:bg-gray-50 h-8 sm:h-6 px-2 sm:px-1 flex-shrink-0"
                            >
                              <X className="w-4 h-4 sm:w-3 sm:h-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 min-h-[24px] mb-[5px]">
                            <span className="text-base font-semibold truncate">
                              {calc.name || `${calc.width || 0}x${calc.height || 0}mm (${calc.totalLength}mm)`}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                startEditing(calc.id, calc.name || "")
                              }
                              className="h-6 w-6 p-0 flex-shrink-0"
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                        <div className="text-sm text-gray-600">
                          크기: {calc.width || 0} × {calc.height || 0}mm
                        </div>
                        <div className="text-sm text-gray-600">
                          둘레: {calc.totalLength}mm · 전원코드: {calc.includePowerCord ? "포함" : "미포함"}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(calc.createdAt).toLocaleString("ko-KR")}
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteCalculation(calc.id)}
                          className="h-8 w-8 p-0 flex-shrink-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <AccordionTrigger className="px-[10px] pb-[10px] [&[data-state=open]>svg]:rotate-180 [&>svg:not(.custom-icon)]:hidden">
                    <div className="flex items-center gap-0">
                      <span className="text-sm">상세보기</span>
                      <svg
                        className="h-4 w-4 shrink-0 transition-transform duration-200 ml-1 custom-icon"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6,9 12,15 18,9"></polyline>
                      </svg>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-[10px] pb-[10px]">
                    <div className="space-y-[10px]">
                      {calc.combinations.map((combination, idx) =>
                        renderCombinationTable(combination, idx),
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
          </Accordion>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-base">최근 계산한 결과가 없습니다.</div>
          </div>
        )}
      </div>
    </div>
  );
}