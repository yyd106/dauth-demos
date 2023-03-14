import SignatureData from '@/components/SignatureData';
import VerifiedList from '@/components/VerifiedList';
import { dauth_getUserInfo } from '@/services/http';
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import MediaList from "../components/MediaList";
export default function Home() {



  return (
    <div className='flex flex-row'>
      <div className='w-1/2 h-full p-20 bg-dark'>
        <div className='flex flex-row justify-around my-10'>
          <div className='w-28 h-28 bg-[#2b2b2b] rounded-full mr-10'>

          </div>
          <div className='w-4/5 flex flex-col justify-evenly'>
            <div className='bg-[#2b2b2b] rounded-2xl w-20 h-4'>
            </div>
            <div className='bg-[#2b2b2b] rounded-2xl w-32 h-4'>
            </div>
            <div>
              <MediaList />
            </div>
          </div>
        </div>
        <VerifiedList />

      </div>
      <div className='w-1/2 h-auto bg-liner  p-16 '>
        <SignatureData />
      </div>
    </div>
  )
}
