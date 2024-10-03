"use client"
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../../firebaseConfig";

const PasswordResetPage = () => {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      // Firestore에서 사용자 아이디와 이메일이 매칭되는지 확인
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("userId", "==", userId), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("해당 아이디와 이메일을 가진 사용자를 찾을 수 없습니다.");
      }

      // Firebase Auth로 비밀번호 재설정 이메일 전송
      await sendPasswordResetEmail(auth, email);
      setMessage("비밀번호 재설정 링크가 이메일로 전송되었습니다.");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError("비밀번호 재설정 이메일 전송 실패: " + error.message);
      } else {
        setError("비밀번호 재설정 중 알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div>
      <h2>비밀번호 재설정</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handlePasswordReset}>
        <div>
          <label>아이디:</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
        </div>
        <div>
          <label>이메일:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit">비밀번호 재설정 이메일 보내기</button>
      </form>
    </div>
  );
};

export default PasswordResetPage;
