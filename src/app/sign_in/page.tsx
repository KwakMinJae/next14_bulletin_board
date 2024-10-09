"use client"
import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged, User } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../../firebaseConfig"; // Firestore와 Firebase Auth 가져오기
import { useRouter } from "next/navigation";
import Link from "next/link";
import Icon from "../component/Icon";

const LoginPage = () => {
    const router = useRouter();
    const [userId, setUserId] = useState<string>(""); // userId의 타입 지정
    const [password, setPassword] = useState<string>(""); // password의 타입 지정
    const [error, setError] = useState<string>(""); // error의 타입 지정
    const [user, setUser] = useState<User | null>(null); // currentUser의 타입 지정


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
        // Firestore에서 userId로 이메일을 찾기
        const usersRef = collection(db, "users");
        const userIdQuery = query(usersRef, where("userId", "==", userId));
        const userIdSnapshot = await getDocs(userIdQuery);
        
        if (userIdSnapshot.empty) {
            throw new Error("존재하지 않는 사용자 ID입니다.");
        }

        const userDoc = userIdSnapshot.docs[0].data();
        const email = userDoc.email; // Firestore에서 가져온 이메일

        // Firebase Auth로 로그인 시도
        await signInWithEmailAndPassword(auth, email, password);
        router.back();
        // 로그인 성공 후 추가 처리 (예: 리다이렉트)
        } catch (error: any) {
            if (error.code === "auth/invalid-credential") {
                setError("비밀번호가 틀렸습니다."); // 비밀번호가 틀린 경우
            } else {
                setError("로그인 중 오류가 발생했습니다."); // 기타 오류 처리
            }
        }
    };

    return (
        <div>
            <div className="bg-gray-100">
                <div className='mx-60'>
                    <h2 className="ml-2 text-5xl font-bold text-blue-600/100 flex items-center py-4">
                        Login
                        <Icon name="cloud" className="w-20 h-20 ms-2" />
                    </h2>
                    {/* {error && <p style={{ color: "red" }}>{error}</p>} */}
                    <div>
                        <form onSubmit={handleLogin}>
                            <div>
                            {/* <label htmlFor="userId">아이디: </label> */}
                            <input
                                placeholder="아이디"
                                type="text"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 hover:border-blue-400 transition duration-200 px-2 py-2"
                                required
                            />
                            </div>
                            <div>
                            {/* <label>Password:</label> */}
                            <input
                                placeholder="비밀번호"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 hover:border-blue-400 transition duration-200 px-2 py-2"
                                required
                            />
                            </div>
                            {error && <p style={{ color: "red" }}>{error}</p>}
                            <button type="submit">로그인</button>
                        </form>
                        <Link href="../../sign_up">회원가입</Link>
                        <Link href="../../find_id">아이디 찾기</Link>
                        <Link href="../../password_reset">비밀번호 재설정</Link>
                    </div>
                </div>
            </div>
        </div>
    );
    };

export default LoginPage;
