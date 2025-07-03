// components/UserProfile.tsx
import Image from 'next/image';

export default function UserProfile() {
  return (
    <div className="space-x-4 mb-6">
      <div className="w-60 h-80 bg-gray-300 overflow-hidden rounded-sm relative">
        <Image
          src="/images/profile.jpeg"
          alt="Profile"
          fill
          className=" object-cover"
        />
      </div>
      <div>
        <h1 className="text-2xl font-bold">Jazzer Giancarlo M. Ancheta</h1>
        <div className='bg-gray-300 w-100 h-1 mt-5 rounded-full mb-2'>
        </div>
        <h1 className=' font-bold text-2xl'>Information</h1>
        {/* <p className="text-gray-600">Stanford Alum</p> */}
        <p className="text-gray-600">Laoag City, Ilocos Norte</p>
      </div>
    </div>
  );
}