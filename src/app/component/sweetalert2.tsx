import React from "react"
import Swal from "sweetalert2"
import 'sweetalert2/src/sweetalert2.scss'

type SwalProps = {
    name: 'success' | 'error' | 'warning' | 'info' | 'question' | 'confirm'
    swaltext?: string;
}

const SweetAlert2: React.FC<SwalProps> = ({ name, swaltext }) => {
    switch (name) {
        case 'success' :
            Swal.fire({
                icon: 'success',
                html: `<p class="font-base text-xl">${swaltext}</p>`,
                confirmButtonText: '확인',
                customClass: {
                    confirmButton: 'bg-green-500 text-white'
                }
            })
            break;
        case 'error' :
            Swal.fire({
                icon: 'error',
                html: `<p class="font-base text-xl">${swaltext}</p>`,
                confirmButtonText: '확인',
                customClass: {
                    confirmButton: 'bg-red-500 text-white'
                }
            })
            break;
        case 'warning' :
            Swal.fire({
                icon: 'warning',
                html: `<p class="font-base text-xl">${swaltext}</p>`,
                confirmButtonText: '확인',
                customClass: {
                    confirmButton: 'bg-yellow-500 text-white'
                }
            })
            break;
        case 'info' :
            Swal.fire({
                icon: 'info',
                html: `<p class="font-base text-xl">${swaltext}</p>`,
                confirmButtonText: '확인',
                customClass: {
                    confirmButton: 'bg-blue-500 text-white'
                }
            })
            break;
        case 'question' :
            Swal.fire({
                icon: 'question',
                html: `<p class="font-base text-xl">${swaltext}</p>`,
                confirmButtonText: '확인',
                customClass: {
                    confirmButton: 'bg-blue-500 text-white'
                }
            })
            break;
        case 'confirm' :
            Swal.fire({
                title: '삭제 확인',
                text: '정말로 삭제하시겠습니까?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: '삭제',
                cancelButtonText: '취소',
              })
        default :
            return null;
            break;
    }
}
export default SweetAlert2