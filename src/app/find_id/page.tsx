"use client";
import { useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebaseConfig";

const FindIdPage = () => {
  const [email, setEmail] = useState<string>(""); // 이메일 입력 상태
  const [userId, setUserId] = useState<string | null>(null); // 찾은 ID 상태
  const [error, setError] = useState<string>(""); // 오류 상태

  const handleFindId = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // 초기화
    setUserId(null); // 이전 결과 초기화

    try {
      // Firestore에서 email로 사용자 정보 검색
      const usersRef = collection(db, "users");
      const emailQuery = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(emailQuery);

      if (querySnapshot.empty) {
        setError("등록된 이메일이 없습니다.");
        return;
      }

      // 첫 번째 결과를 사용 (여러 사용자가 동일 이메일을 가질 수 없다고 가정)
      const userDoc = querySnapshot.docs[0].data();
      const foundUserId = userDoc.userId;

      setUserId(foundUserId);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError("아이디 찾기 실패: " + error.message);
      } else {
        setError("아이디 찾기 중 알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div>
      <div className="bg-gray-100">
        <div className='mx-60'>
          <div className="flex justify-center">
            <div className="pb-8 max-w-md w-full" >
            <h2 className="text-5xl font-bold text-blue-600/100 flex items-center py-4 my-4">Find Id</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {userId ? (
              <p className="text-xl">해당 이메일로 등록된 아이디는 <span className="font-bold">{userId}</span> 입니다.</p>
            ) : (
              <form onSubmit={handleFindId}>
                <div>
                  <label htmlFor="userEmail" className="font-semibold">이메일</label>
                  <input
                    id="userEmail"
                    placeholder="이메일"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 hover:border-blue-400 transition duration-200 px-2 py-3 my-2"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full block text-center my-4 font-semibold text-lg"
                >
                  아이디 찾기
                </button>
              </form>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindIdPage;
