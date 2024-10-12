// app/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  getFilteredRowModel, // 필터링 관련 로우 모델 추가
  FilterFn,
} from "@tanstack/react-table";
import { Board } from "../types/types";
import Link from "next/link";
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from "firebase/firestore"; // Firestore에서 데이터를 가져오기 위한 함수
import LoadingSpinner from "./component/LoadingSpinner";

// 테이블 컬럼 정의
const columns: ColumnDef<Board>[] = [
  {
    accessorKey: "index",
    header: "번호",
    cell: (info) => (info.row.original.index + 1),
  },
  {
    accessorKey: "subject",
    header: "글제목",
  },
  {
    accessorKey: "writer",
    header: "작성자",
  },
  {
    accessorKey: "date",
    header: "등록일",
  },
  {
    accessorKey: "views",
    header: "조회수",
  },
];

const fuzzyFilter: FilterFn<any> = (row, columnId, value) => {
  // subject와 writer만 필터링
  if (columnId === "subject" || columnId === "writer") {
    const cellValue = row.getValue(columnId);
    console.log(cellValue);
    
    // Fuzzy Search 또는 기본 검색 로직
    if (typeof cellValue === 'string') {
      return cellValue.toLowerCase().includes(value.toLowerCase());
    }
  }

  return false; // 다른 열은 필터링하지 않음
};

const HomePage = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [user, setUser] = useState<User | null>(null); // Update the state type
  const [nickname, setNickname] = useState<string | null>(null); // 닉네임 상태 추가
  const [loading, setLoading] = useState(true);
  // Firestore에서 게시글 데이터 가져오기
  useEffect(() => {
    const fetchBoardsFromFirestore = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "boards")); // Firestore에서 "boards" 컬렉션의 문서 가져오기
        const boardsData: Board[] = querySnapshot.docs.map((doc, index) => ({
          index: doc.data().index, // 게시글 번호
          subject: doc.data().subject,
          writer: doc.data().writer,
          date: doc.data().date,
          views: doc.data().views,
          userId: doc.data().userId,
          content: doc.data().content, // content 필드를 추가
          refresh: doc.data().refresh, // refresh 필드를 추가
        }));
        // setBoards(boardsData); // 가져온 데이터를 상태에 저장
        // index 기준으로 내림차순 정렬
        const sortedBoards = boardsData.sort((a, b) => b.index - a.index);
        setBoards(sortedBoards); // 내림차순으로 정렬된 데이터 저장
      } catch (error) {
        console.error("Error fetching boards from Firestore:", error);
      } finally {
        setLoading(false); // 데이터 로딩 완료
      }
    };

    fetchBoardsFromFirestore(); // Firestore에서 데이터 불러오기
  }, []);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Firestore에서 유저의 닉네임 가져오기
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setNickname(userDoc.data()?.nickname || null); // Firestore에 저장된 닉네임 설정
        }
      } else {
        setNickname(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // 테이블 생성
  const table = useReactTable({
    data: boards,
    columns,
    state: {
      globalFilter,
    },
    globalFilterFn: fuzzyFilter, // Fuzzy Filter 함수 설정
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(), // 필터링된 행 모델을 적용
    // enableGlobalFilter: true, 
  });
  const currentPageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();

  const pageButtons = [
    { label: "<<", onClick: () => table.setPageIndex(0), disabled: !table.getCanPreviousPage() },
    { label: "<", onClick: () => table.previousPage(), disabled: !table.getCanPreviousPage() },
    {
      label: `${currentPageIndex + 1} / ${pageCount}`,
      onClick: () => {}, // 클릭 이벤트 없음
      disabled: true, // 페이지 번호 버튼은 비활성화
    },
    { label: ">", onClick: () => table.nextPage(), disabled: !table.getCanNextPage() },
    { label: ">>", onClick: () => table.setPageIndex(table.getPageCount() - 1), disabled: !table.getCanNextPage() },
  ];

  if (loading) {
    return <LoadingSpinner />; // 데이터 로딩 중일 때 로딩 스피너 표시
  }
  
  return (
    <div>
      <div className="bg-gray-100">
        <div className="mx-60">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center justify-center flex-col">
              <h2 className="ml-2 text-5xl font-bold text-blue-600/100">Free Board</h2>
            </div>
            <div className="flex items-end flex-col mx-0">
              <div className="">
                {user ? (
                  <Link 
                    href="./write"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded block text-center mb-2 font-semibold text-lg flex"
                  >
                    <div>글 쓰기</div>
                  </Link>
                  ) : (
                  <Link 
                    href="./sign_in"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded block text-center mb-2 font-semibold text-lg"
                  >
                    글 쓰기
                  </Link>
                )}
              </div>
              <input
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="검색..."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 hover:border-blue-400 transition duration-200 px-2 py-2"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <table className="w-full mx-60">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="grid grid-cols-12">
                  {headerGroup.headers.map((header, idx) => (
                    <th 
                      key={header.id}
                      className={`${
                        idx === 0
                          ? "col-span-1"
                          : idx === 1
                          ? "col-span-6"
                          : idx === 2
                          ? "col-span-2"
                          : idx === 3
                          ? "col-span-2"
                          : "col-span-1"
                      } bg-gray-200 p-5 border border-gray-300 mx-0 font-semibold rounded-t-lg`}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <Link href={`/view?index=${row.original.index}`} key={row.id} className="block">
                  <tr key={row.id} className="grid grid-cols-12 cursor-pointer hover:text-blue-700">
                    {row.getVisibleCells().map((cell, idx) => (
                        <td 
                          key={cell.id}
                          className={`${
                            idx === 0
                              ? "col-span-1 text-center"
                              : idx === 1
                              ? "col-span-6"
                              : idx === 2
                              ? "col-span-2"
                              : idx === 3
                              ? "col-span-2"
                              : "col-span-1 text-center"
                          } p-5 border border-gray-300 mx-0`}
                        >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                </Link>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-center py-4">
          {pageButtons.map((btn) => (
            <button
              key={btn.label}
              onClick={btn.onClick}
              disabled={btn.disabled}
              className={`font-bold py-2 px-4 rounded mx-1 ${btn.disabled ? 'bg-gray-300 cursor-not-allowed' : 'cursor bg-blue-500 hover:bg-blue-700'}`}
              style={{
                backgroundColor: btn.label.includes('/') ? '#4A90E2' : 'bg-blue-300', // 페이지 번호 버튼 색상 설정
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
