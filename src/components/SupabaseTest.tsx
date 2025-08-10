import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function SupabaseTest() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const runConnectionTest = async () => {
    setIsLoading(true);
    setTestResult('테스트 시작...\n');

    try {
      // 1. 설정 정보 확인
      setTestResult(prev => prev + `✅ 프로젝트 ID: ${projectId}\n`);
      setTestResult(prev => prev + `✅ Public Anon Key: ${publicAnonKey.substring(0, 20)}...\n`);

      // 2. Health check 테스트
      setTestResult(prev => prev + '🔍 서버 연결 테스트...\n');
      const healthResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d6aea025/health`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (healthResponse.ok) {
        setTestResult(prev => prev + '✅ 서버 연결 성공\n');
      } else {
        setTestResult(prev => prev + `❌ 서버 연결 실패: ${healthResponse.status}\n`);
      }

      // 3. 테스트 데이터 저장
      setTestResult(prev => prev + '💾 테스트 데이터 저장 중...\n');
      const testData = {
        totalLength: 1000,
        includePowerCord: true,
        combinations: [
          {
            combinations: [
              { type: '600', quantity: 1, usedLength: 560 },
              { type: 'T5코드', quantity: 1, usedLength: 60 }
            ],
            totalUsedLength: 620,
            remainingLength: 380
          }
        ]
      };

      const saveResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d6aea025/save-calculation`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testData),
        }
      );

      if (saveResponse.ok) {
        const saveResult = await saveResponse.json();
        setTestResult(prev => prev + `✅ 데이터 저장 성공: ${saveResult.calculationId}\n`);

        // 4. 저장된 데이터 조회
        setTestResult(prev => prev + '📖 데이터 조회 테스트...\n');
        const getResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-d6aea025/get-calculation/${saveResult.calculationId}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (getResponse.ok) {
          const getData = await getResponse.json();
          if (getData.success && getData.data) {
            setTestResult(prev => prev + '✅ 데이터 조회 성공\n');
          } else {
            setTestResult(prev => prev + '❌ 데이터 조회 실패: 빈 데이터\n');
          }
        } else {
          setTestResult(prev => prev + `❌ 데이터 조회 실패: ${getResponse.status}\n`);
        }

        // 5. 최근 데이터 목록 조회
        setTestResult(prev => prev + '📋 최근 데이터 목록 조회...\n');
        const recentResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-d6aea025/recent-calculations`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (recentResponse.ok) {
          const recentData = await recentResponse.json();
          if (recentData.success && recentData.data) {
            setTestResult(prev => prev + `✅ 최근 데이터 ${recentData.data.length}개 조회 성공\n`);
          } else {
            setTestResult(prev => prev + '❌ 최근 데이터 조회 실패\n');
          }
        } else {
          setTestResult(prev => prev + `❌ 최근 데이터 조회 실패: ${recentResponse.status}\n`);
        }

      } else {
        const errorText = await saveResponse.text();
        setTestResult(prev => prev + `❌ 데이터 저장 실패: ${saveResponse.status} - ${errorText}\n`);
      }

      setTestResult(prev => prev + '\n🎉 모든 테스트 완료!\n');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setTestResult(prev => prev + `❌ 테스트 중 오류 발생: ${errorMessage}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>🔧 Supabase 연동 테스트</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button
            onClick={runConnectionTest}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? '테스트 실행 중...' : 'Supabase 연결 테스트 실행'}
          </Button>
          
          {testResult && (
            <div className="bg-gray-100 p-4 rounded-md">
              <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
            </div>
          )}
          
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>현재 설정:</strong></p>
            <p>• 프로젝트 URL: https://{projectId}.supabase.co</p>
            <p>• 프로젝트 ID: {projectId}</p>
            <p>• Public Anon Key: {publicAnonKey.substring(0, 20)}...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}