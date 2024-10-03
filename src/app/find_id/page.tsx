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
      <h2>아이디 찾기</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {userId ? (
        <p>해당 이메일로 등록된 아이디는: <strong>{userId}</strong>입니다.</p>
      ) : (
        <form onSubmit={handleFindId}>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit">아이디 찾기</button>
        </form>
      )}
    </div>
  );
};

export default FindIdPage;
