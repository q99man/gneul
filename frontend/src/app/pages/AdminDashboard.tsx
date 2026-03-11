import React, { useEffect, useState } from "react";
import { Layout } from "../components/ui/Layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import type { ReactNode } from "react";
import { toast } from "sonner";

type MemberItem = {
  id: number;
  email: string;
  name: string;
  role: string;
};

type SpaceItem = {
  id: number;
  spaceName: string;
  price: number;
  host?: {
    name: string;
  } | null;
};

type TabKey = "members" | "spaces";

export const AdminDashboardContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabKey>("members");
  const [items, setItems] = useState<MemberItem[] | SpaceItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/${currentTab}`);
      if (!res.ok) {
        throw new Error("failed");
      }
      const data = await res.json();
      setItems(data || []);
    } catch (error) {
      toast(
        "데이터 로드 실패",
        {
          description: "관리자 권한이 없거나 데이터를 불러올 수 없습니다.",
        } as { description: ReactNode },
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [currentTab]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("정말로 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(
        `/api/admin/${currentTab === "members" ? "member" : "space"}/${id}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        throw new Error("failed");
      }
      toast(
        "삭제 완료",
        { description: "선택한 항목이 삭제되었습니다." } as {
          description: ReactNode;
        },
      );
      void loadData();
    } catch (error) {
      toast(
        "삭제 실패",
        { description: "삭제 처리에 실패했습니다." } as {
          description: ReactNode;
        },
      );
    }
  };

  const renderTableHeader = () => {
    if (currentTab === "members") {
      return (
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>이메일</TableHead>
          <TableHead>이름</TableHead>
          <TableHead>권한</TableHead>
          <TableHead className="text-right">작업</TableHead>
        </TableRow>
      );
    }
    return (
      <TableRow>
        <TableHead>ID</TableHead>
        <TableHead>공간명</TableHead>
        <TableHead>가격</TableHead>
        <TableHead>호스트</TableHead>
        <TableHead className="text-right">작업</TableHead>
      </TableRow>
    );
  };

  const renderTableBody = () => {
    if (!items.length) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center text-muted-foreground">
            {loading ? "불러오는 중..." : "데이터가 없습니다."}
          </TableCell>
        </TableRow>
      );
    }

    return items.map((item) => {
      const commonCells = (
        <>
          <TableCell>{item.id}</TableCell>
          {currentTab === "members" ? (
            <>
              <TableCell>{(item as MemberItem).email}</TableCell>
              <TableCell>{(item as MemberItem).name}</TableCell>
              <TableCell>{(item as MemberItem).role}</TableCell>
            </>
          ) : (
            <>
              <TableCell>{(item as SpaceItem).spaceName}</TableCell>
              <TableCell>
                {(item as SpaceItem).price.toLocaleString()}원
              </TableCell>
              <TableCell>
                {(item as SpaceItem).host?.name ?? "관리자"}
              </TableCell>
            </>
          )}
        </>
      );

      return (
        <TableRow key={item.id}>
          {commonCells}
          <TableCell className="text-right">
            <Button
              variant="ghost"
              className="text-red-500 hover:text-red-600"
              onClick={() => handleDelete(item.id)}
            >
              삭제
            </Button>
          </TableCell>
        </TableRow>
      );
    });
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 md:py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          관리자 대시보드
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          회원과 공간을 한 곳에서 관리합니다.
        </p>
      </div>

      <Card className="p-4 md:p-6">
        <Tabs
          value={currentTab}
          onValueChange={(value) => setCurrentTab(value as TabKey)}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <TabsList>
              <TabsTrigger value="members">회원 관리</TabsTrigger>
              <TabsTrigger value="spaces">공간 관리</TabsTrigger>
            </TabsList>
            <div className="text-xs text-muted-foreground">
              {loading
                ? "데이터를 불러오는 중입니다..."
                : "필요 시 항목을 삭제할 수 있습니다."}
            </div>
          </div>

          <div className="mt-4">
            <Table>
              <TableHeader>{renderTableHeader()}</TableHeader>
              <TableBody>{renderTableBody()}</TableBody>
            </Table>
          </div>
        </Tabs>
      </Card>
    </div>
  );
};

const AdminDashboardPage: React.FC = () => (
  <Layout>
    <AdminDashboardContent />
  </Layout>
);

export default AdminDashboardPage;

