"use client"
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { collection, doc, setDoc, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../../../firebaseConfig";
import { useState } from "react";
import emailjs from "emailjs-com";
import { service_id, template_id, user_id } from "../../../emailjs";
import { useRouter } from "next/navigation";
import SweetAlert2 from "../component/sweetalert2";

const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const registerUser = async (userId: string, email: string, nickname: string) => {
  try {
    // Check if the email is already registered
    const usersRef = collection(db, 'users');
    const userIdQuery = query(usersRef, where('userId', '==', userId));
    const userIdSnapshot = await getDocs(userIdQuery);
    if (!userIdSnapshot.empty) {
      SweetAlert2({ name: 'error', swaltext: '이미 사용 중인 사용자 ID입니다.'})
      throw new Error('이미 사용 중인 사용자 ID입니다.');
      return false;
    }

    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      SweetAlert2({ name: 'error', swaltext: '이미 사용 중인 이메일입니다.'})
      throw new Error('이미 사용 중인 이메일입니다.');
      return false;
    }

    const nicknameQuery = query(usersRef, where('nickname', '==', nickname));
    const nicknameSnapshot = await getDocs(nicknameQuery);

    if (!nicknameSnapshot.empty) {
      SweetAlert2({ name: 'error', swaltext: '이미 사용 중인 닉네임입니다.'})
      throw new Error('이미 사용 중인 닉네임입니다.');
      return false;
    }

    console.log("User registered. Verification email sent.");
    return true;
  } catch (error) {
    console.error("Error registering user:", error);
    return false;
  }
};

export default function RegisterPage() {
    const [userId, setUserId] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [nickname, setNickname] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [enteredCode, setEnteredCode] = useState("");
    const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
  
      if (password !== confirmPassword) {
        setError("비밀번호가 일치하지 않습니다.");
        return;
      }
      const check = await registerUser(userId, email, nickname);
      if (!check) {
        return;
      }
      try {
        // Generate and send a 6-digit verification code
        setError("");
        const code = generateVerificationCode();
        setVerificationCode(code);
        const templateParams = {
          to_email: email,
          verification_code: code,
        };
        await emailjs.send(service_id ||'', template_id||'', templateParams, user_id||'');
        // Ask the user to enter the code
        SweetAlert2({ name: 'info', swaltext: '인증번호가 이메일로 전송되었습니다.'})
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError("회원가입 실패: " + error.message);
        } else {
          setError("회원가입 중 알 수 없는 오류가 발생했습니다.1");
        }
      }
    };
  
    const handleVerification = async () => {
      if (enteredCode === verificationCode) {
        setIsVerified(true);
        SweetAlert2({ name: 'success', swaltext: '이메일 인증이 완료되었습니다!'})
        try {
          // registerUser가 성공적으로 실행되면 true 반환
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
    
          // Send verification email
          await sendEmailVerification(user);
    
          // Save the user information in Firestore
          await setDoc(doc(db, "users", user.uid), {
            email,
            userId,
            nickname,
            verified: false // Set this to true once email is verified
          });
          SweetAlert2({ name: 'success', swaltext: '회원가입이 완료되었습니다!'})
          router.push(`/`); // 회원가입 성공 후 이동
        } catch (error: unknown) {
          if (error instanceof Error) {
            setError("회원가입 실패: " + error.message);
          } else {
            setError("회원가입 중 알 수 없는 오류가 발생했습니다.");
          }
        }
      } else {
        setError("인증번호가 일치하지 않습니다.");
      }
    };
  
    return (
        <div>
          <div className="bg-gray-100">
            <div className='mx-60'>
                <div className="flex justify-center">
                  <div className="pb-8 max-w-md w-full">
                  <h2 className="text-5xl font-bold text-blue-600/100 flex items-center py-4 my-4">Sign Up</h2>
          <form onSubmit={handleSubmit} >
            <div>
              <label htmlFor="userId" className="font-semibold">아이디</label>
              <input
                id="userId"
                type="text"
                placeholder="아이디"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="block w-full border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 hover:border-blue-400 transition duration-200 px-2 py-3 my-2"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="font-semibold">이메일</label>
              <input
                id="email"
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 hover:border-blue-400 transition duration-200 px-2 py-3 my-2"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="font-semibold">비밀번호</label>
              <input
                id="password"
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 hover:border-blue-400 transition duration-200 px-2 py-3 my-2"
                required
              />
            </div>
            <div>
              <label htmlFor="passwordConfirm" className="font-semibold">비밀번호 확인</label>
              <input
                id="passwordConfirm"
                type="password"
                placeholder="비밀번호 확인"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 hover:border-blue-400 transition duration-200 px-2 py-3 my-2"
                required
              />
            </div>
            <div>
              <label htmlFor="nickname" className="font-semibold">닉네임</label>
              <input
                id="nickname"
                type="text"
                placeholder="닉네임"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="block w-full border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 hover:border-blue-400 transition duration-200 px-2 py-3 my-2"
                required
              />
            </div>
            {error && <p style={{ color: "red" }} className="my-4">{error}</p>}
            <button 
              type="submit"
              className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full block text-center my-4 font-semibold text-lg"
            >
              인증번호 받기
            </button>
          </form>

        {/* Verification Code Input */}
          {verificationCode && (
            <div>
              <label htmlFor="enteredCode" className="font-semibold">이메일 인증</label>
              <input
                id="enteredCode"
                type="text"
                placeholder="인증번호를 입력하세요"
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value)}
                className="block w-full border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 hover:border-blue-400 transition duration-200 px-2 py-3 my-2"
                required
              />
              <button 
                onClick={handleVerification}
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full block text-center my-4 font-semibold text-lg"
              >
                회원가입 하기
              </button>
            </div>
          )}
          </div>
          </div>
          </div>
        </div>
      </div>
    );
  }