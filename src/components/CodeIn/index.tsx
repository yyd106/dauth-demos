import { dauth_confirmRegisteredEmail, dauth_registerEmail } from '@/services/http';
import { encrypt, hashAndEncrypt } from '@/utils/crypto';
import exchangeKey from '@/utils/exchangeKey';
import { useCountDown, useRequest } from 'ahooks';
import React, { FC, useEffect, useRef, useState } from 'react'
import AuthCode, { AuthCodeRef } from 'react-auth-code-input';
import { FiMail } from 'react-icons/fi'
import { motion } from "framer-motion"
import { CgSpinnerAlt } from "react-icons/cg"
import { useRouter } from 'next/router';
import { sleep } from '@/utils';

interface ICodeIn {
    email: string,
    resend: () => Promise<void>
    show: boolean
}
const coldDown = 60 * 1000
enum Estep {
    failed = -1,
    ready,
    success,
}
const inputClasses: any = {
    [Estep.success]: "bg-[#1d322a] text-[#40aa84] border-[#40aa84]",
    [Estep.failed]: "bg-[#3f292c] text-[#EE736F] border-[#EE736F]",
    [Estep.ready]: " bg-[#262629] text-white border-[#383838]",
}
const CodeIn: FC<ICodeIn> = ({ email, resend, show }) => {
    const AuthInputRef = useRef<AuthCodeRef>(null);
    const router = useRouter()
    const [code, setResult] = useState('');
    const [targetDate, setTargetDate] = useState(Date.now() + coldDown)
    const [resendShow, setResendShow] = useState(false)
    const [status, setStatus] = useState(Estep.ready)
    const [isLoading, setIsLoading] = useState(false)
    const handleOnChange = (res: string) => {
        setStatus(Estep.ready)

        setResult(res);
    };
    const [, formattedRes] = useCountDown(
        {
            targetDate,
            onEnd: () => { setResendShow(true) }
        }
    );
    const onResend = async () => {
        setResendShow(false)
        AuthInputRef.current?.clear()
        AuthInputRef.current?.focus()
        setStatus(Estep.ready)
        setTargetDate(Date.now() + coldDown)
        await resend()
    }
    const submitCode = async () => {
        try {
            setIsLoading(true)
            const { session_id, shareKey } = await exchangeKey.exchange()
            const cipher_code = await encrypt(code, shareKey)
            const res = await dauth_confirmRegisteredEmail({ cipher_code, session_id })
           
            localStorage.setItem('token', res.token)
            await sleep(1)
            setIsLoading(false)
            setStatus(Estep.success)
            await sleep(0.5)
            router.push('/')
            
        } catch (error) {
            setIsLoading(false)
            setStatus(Estep.failed)
        }
    }
    const {run} = useRequest(submitCode, {
        ready: code.length === 6,
        debounceWait: 200,
    });

    return (
        <div className='flex flex-col justify-center items-center w-full '>
            <div className='rounded-3xl flex justify-center items-center mb-4' >
                <FiMail size={54} />
            </div>
            <div className='text-center'>
                <div className='text-xl font-semibold'>
                    Confirm verification code
                </div>
                <div className=' text-sm text-[#ffffff80]'>
                    We&apos;ve sent a code to
                </div>
                <div>
                    {email}
                </div>
            </div>
            <div className='mt-6'>
                {
                    isLoading && <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <CgSpinnerAlt color={"w"} size={40} />
                    </motion.div>
                }
                <div className={`${isLoading ? 'hidden' : 'block'}`}>
                    <AuthCode
                        ref={AuthInputRef}
                        isPassword={!show}
                        allowedCharacters='numeric'
                        containerClassName='flex w-full justify-evenly'
                        inputClassName={`lg:w-12 lg:h-12 w-10 h-10 mx-2 last:mr-0 rounded-xl outline-none text-center border  lg:text-[22px] text-[20px] ${inputClasses[status]}`}
                        onChange={handleOnChange} />
                    <div className='mt-10 text-center  text-sm font-semibold'>
                        {
                            status === Estep.ready && <>
                                <span className='text-[#898989] inline-block mr-1 '>Didn&apos;t receive it?</span>
                                {
                                    resendShow ? <span className='text-main cursor-pointer' onClick={onResend}>Resend</span> : <span className='text-main'>{formattedRes.seconds}s</span>
                                }
                            </>
                        }
                        {
                            status === Estep.success && <span className='text-[#40AA84] inline-block mr-1'>Wecome! <span className='text-xl'>🎉</span></span>
                        }
                        {
                            status === Estep.failed && <div className=' text-sm'>
                                <div className='text-[#CB6462] inline-block mr-1'>Incorrect code. Please try again.</div>
                                <div>
                                    <span className='text-[#898989] inline-block mr-1'>Didn&apos;t receive it?</span>
                                    {
                                        resendShow ? <span className='text-main cursor-pointer' onClick={onResend}>Resend</span> : <span className='text-main'>{formattedRes.seconds}s</span>
                                    }
                                </div>

                            </div>
                        }

                    </div>
                </div>
            </div>
        </div>
    )
}

export default CodeIn