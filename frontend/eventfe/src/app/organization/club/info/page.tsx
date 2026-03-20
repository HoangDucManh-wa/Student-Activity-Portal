"use client"
import Link from "next/link"
import Image from "next/image";
import { useState } from "react"
export default function ClubInfoPage(){
  const [isOpen, setIsOpen] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  return (
    <div>
      <div className="min-h-screen relative h-[300px] mb-[35px]">
        <Image
          src="/team-building.jpg"
          alt="team-building"
          fill
          priority
          className="w-full h-full object-cover object-center"
        />
      </div>

      <div className="flex justify-around">
        <Image
          src="/team-building.jpg"
          alt="team-building"
          width={1200}
          height={400}
          className="w-[510px] h-[288] rounded-[29px]"
        />

        <div className="flex flex-col items-center gap-[15px]">
          <Image
            src="/logo-club.jpg"
            alt="logo-club"
            width={150}
            height={150}
            className="rounded-full"
          />
          <div className="text-[#1A73E8] text-[28px] font-bold">
            BIT - CLB TIN HỌC NGÂN HÀNG
          </div>
        </div>

        <Image
          src="/team-building.jpg"
          alt="team-building"
          width={1200}
          height={400}
          className="w-[510px] h-[288px] rounded-[29px]"
        />
      </div>

      <div className="flex items-center w-full my-10">
        <div className="flex-1 h-[3px] bg-[#08667a]"></div>
        <div>
          <span className="bg-[#08667a] text-white px-8 py-2 rounded-full font-bold text-[16px] uppercase tracking-wider">
            Giới thiệu
          </span>
        </div>
        <div className="flex-1 h-[3px] bg-[#08667a]"></div>
      </div>

      <div className="mx-[20px] rounded-[20px] border-[3px] border-[#1A73E8] p-[20px] h-[600px]">
        Lorem ipsum, dolor sit amet consectetur adipisicing elit...
      </div>

      <div className="flex justify-center gap-6 mt-10 flex-wrap mb-10">
        <button
          onClick={() => setIsOpen(true)}
          className={`px-6 py-2 rounded-full font-semibold transition ${
            isOpen
              ? "bg-[#08667a] text-white"
              : "bg-gray-300 text-gray-500"
          }`}
        >
          Mở đơn đăng ký
        </button>


        <button
          onClick={() => setIsOpen(false)}
          className={`px-6 py-2 rounded-full font-semibold transition ${
            !isOpen
              ? "bg-[#08667a] text-white"
              : "bg-gray-300 text-gray-500"
          }`}
        >
          Đóng đơn đăng ký
        </button>

        <Link href="/organization/club/info/edit">
          <button className="bg-[#08667a] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#06505f] transition">
            Chỉnh sửa thông tin
          </button>
        </Link>

        <button
          onClick={() => setShowModal(true)}
          className="bg-[#08667a] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#06505f] transition"
        >
          Cập nhật đơn đăng ký
        </button>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[400px] text-center shadow-lg">
            <div className="font-bold mb-4 uppercase">
              Gửi cập nhật link form đăng kí CLB
            </div>

            <input
              placeholder="Nhập link..."
              className="w-full px-3 py-2 rounded-md border mb-4 outline-none"
            />

            <button
              className="bg-[#08667a] text-white px-4 py-2 rounded-md"
              onClick={() => {
                setShowModal(false)
                setShowSuccess(true)
              }}
            >
              Gửi cập nhật
            </button>
          </div>
        </div>
      )}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[400px] text-center shadow">
            
            <div className="flex justify-center mb-4">
              <div className="bg-[#08667a] text-white rounded-full w-10 h-10 flex items-center justify-center">
                ✓
              </div>
            </div>

            <div className="font-bold text-lg mb-2">
              Cập nhật thành công
            </div>

            <div className="text-gray-600 mb-4">
              Thông tin đã được cập nhật vào hệ thống
            </div>

            <button
              onClick={() => {setShowSuccess(false)}}
              className="bg-[#08667a] text-white px-4 py-2 rounded"
            >
              Xác nhận
            </button>

          </div>
        </div>
      )}
    </div>
  );
}