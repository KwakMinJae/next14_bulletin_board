"use client"
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { collection, doc, setDoc, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../../../firebaseConfig";
import { useState } from "react";
import emailjs from "emailjs-com";
import { service_id, template_id, user_id } from "../../../emailjs";

const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const registerUser = async (userId: string, email: string, password: string, nickname: string) => {
  try {
    // Check if the email is already registered
    const usersRef = collection(db, 'users');
    const userIdQuery = query(usersRef, where('userId', '==', userId));
    const userIdSnapshot = await getDocs(userIdQuery);
    if (!userIdSnapshot.empty) {
      throw new Error('이미 사용 중인 사용자 ID입니다.');
    }

    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      throw new Error('이미 사용 중인 이메일입니다.');
    }

    const nicknameQuery = query(usersRef, where('nickname', '==', nickname));
    const nicknameSnapshot = await getDocs(nicknameQuery);

    if (!nicknameSnapshot.empty) {
      throw new Error('이미 사용 중인 닉네임입니다.');
    }

    // Create the user in Firebase Auth
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

    console.log("User registered. Verification email sent.");
  } catch (error) {
    console.error("Error registering user:", error);
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
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
  
      if (password !== confirmPassword) {
        setError("비밀번호가 일치하지 않습니다.");
        return;
      }
  
      try {
        // Generate and send a 6-digit verification code
        const code = generateVerificationCode();
        setVerificationCode(code);
        // Here you should integrate with an email sending service to send the `code` to the user's email
        console.log(`인증번호가 이메일로 전송되었습니다: ${code}`);
        const templateParams = {
          to_email: email,
          verification_code: code,
        };
        await emailjs.send(service_id ||'', template_id||'', templateParams, user_id||'');
        // Ask the user to enter the code
        alert("인증번호가 이메일로 전송되었습니다. 확인 후 입력해주세요.");
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
        alert("이메일 인증이 완료되었습니다!");
        try {
          await registerUser(userId, email, password, nickname);
          alert("회원가입이 완료되었습니다!");
          
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
        <h2>회원가입</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>User ID:</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Confirm Password:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Nickname:</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
          </div>
          <button type="submit">회원가입</button>
        </form>

        {/* Verification Code Input */}
        {verificationCode && (
          <div>
            <h3>이메일 인증</h3>
            <input
              type="text"
              placeholder="인증번호를 입력하세요"
              value={enteredCode}
              onChange={(e) => setEnteredCode(e.target.value)}
              required
            />
            <button onClick={handleVerification}>인증번호 확인</button>
          </div>
        )}
      </div>
    );
  }