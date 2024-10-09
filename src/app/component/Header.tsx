"use client"
import { useEffect, useState } from 'react';
import styles from './Header.module.scss'
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import Link from "next/link";
import { auth, db } from "../../../firebaseConfig";
import { doc, getDoc } from 'firebase/firestore';
import Icon from './Icon';

const Header = () => {
    const [user, setUser] = useState<User | null>(null); // Update the state type
    const [nickname, setNickname] = useState<string | null>(null);
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
    const handleLogout = async () => {
        try {
          await signOut(auth); // Sign out the user
        } catch (error) {
          console.error("Logout failed:", error);
        }
    };
    return (
        <>
            <div className='mx-60'>
                <div className='flex items-center justify-between'>
                    <div>
                        <Link href="./">
                            <Icon name="cloud" className="w-20 h-20" />
                        </Link>
                    </div>
                    <div>
                        {user ? ( // Check if a user is authenticated
                            <div className='flex'>
                                <p className='text-center flex items-center font-bold me-3'>{nickname ? `환영합니다, ${nickname} 님` : '로딩 중 ...'} </p>
                                <button onClick={handleLogout} className='flex items-center bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-center'>
                                    <div className='flex'>
                                        <div className='flex'>
                                            <div className='flex items-center'>
                                                <Icon name="logout" className="w-7 h-7 text-black-500" />
                                            </div>
                                            <div className='ms-2 flex items-center text-base'>
                                                로그아웃
                                            </div>
                                        </div>
                                        {/* <div className='text-center ms-2 flex itmes-center'><span>로그아웃</span></div> */}
                                    </div>
                                </button>
                            </div>
                            ) : (
                            <div className='flex items-align'>
                                <Link href="./sign_in" className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded block text-center me-3'>
                                    <div className='flex items-center'>
                                        <div>
                                            <Icon name="login" className="w-7 h-7 text-black-500" />
                                        </div>
                                        <div className='ms-2 flex items-center text-base'>
                                            로그인
                                        </div>
                                    </div>
                                </Link>
                                <Link href="./sign_up" className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded block text-center text-lg'>
                                    <div className='flex items-center'>
                                        <div>
                                            <Icon name="signup" className="w-7 h-7 text-black-500 my-0" />
                                        </div>
                                        <div className='ms-2 flex items-center text-base'>
                                            회원가입
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
export default Header