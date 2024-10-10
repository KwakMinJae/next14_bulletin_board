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
      <div className="bg-gray-100">
        <div className='mx-60'>
          <div className="flex justify-center">
            <div className="pb-8 max-w-md w-full">
            <h2 className="text-5xl font-bold text-blue-600/100 flex items-center py-4 my-4">Pasword Reset</h2>
            {message && <p style={{ color: "green" }}>{message}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handlePasswordReset}>
              <div>
                <label htmlFor="userId" className="font-semibold">아이디</label>
                <input
                  id="userId"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="block w-full border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 hover:border-blue-400 transition duration-200 px-2 py-3 my-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="userEmail" className="font-semibold">이메일</label>
                <input
                  id="userEmail"
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
                비밀번호 재설정 이메일 보내기
              </button>
            </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;
