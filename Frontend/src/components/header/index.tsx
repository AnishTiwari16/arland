import React from 'react';
import ShimmerButton from '../button';
import { account } from '../../App';
import useGlobalStore from '../../store';
import toast from 'react-hot-toast';
import { toastStyles } from '../../lib/helper';
import MyModal from '../modal';
import { ArAccount } from 'arweave-account';
import IconToggle from '../toggle';
import SlideToggle from '../toggle/SlideToggle';
import { QueryClient, useMutation } from '@tanstack/react-query';
import { generateWalletApi } from '../../api';

const Header = () => {
    const [isConnected, setIsConnected] = React.useState(false);
    const { userDetails, setUserDetails, userWallet, setUserWallet } =
        useGlobalStore();
    const [open, setOpen] = React.useState(false);
    const [info, setInfo] = React.useState<any>({});
    const [isToggled, setIsToggled] = React.useState(false);
    const { mutateAsync: addGenerateWalletMutation, isPending } = useMutation({
        mutationFn: generateWalletApi,
        onSuccess: (data) => {
            setUserWallet({ wallet: data.wallet, addr: data.addr });
        },
    });
    const handleConnect = async () => {
        await window.arweaveWallet.connect([
            'ACCESS_ADDRESS',
            'SIGN_TRANSACTION',
            'DISPATCH',
        ]);
        setIsConnected(true);
    };
    const handleGenerateWallet = async () => {
        try {
            await addGenerateWalletMutation();
        } catch (e) {
            console.log(e);
            toast.error('Error generating wallet', toastStyles);
        }
    };
    React.useEffect(() => {
        const handler = async () => {
            const activeAddress = await window.arweaveWallet.getActiveAddress();
            const info: ArAccount = await account.get(activeAddress);
            setInfo(info.profile);
            setUserDetails({
                address: info.handle,
                profile: info.profile.avatarURL,
                name: info.profile.name,
                bio: info.profile.bio,
            });
        };
        if (isConnected) {
            handler();
        }
    }, [isConnected]);
    return (
        <>
            {open && <MyModal open={open} setOpen={setOpen} info={info} />}
            <div className="px-10 mx-auto flex items-center justify-between pt-5">
                <div className="font-bold text-lg">ArMarket</div>

                {!userWallet.addr && !isConnected ? (
                    <div className="flex items-center gap-x-4">
                        <p
                            className={`${
                                !isToggled && 'text-[#ff6b65]'
                            } font-semibold`}
                        >
                            Testnet
                        </p>
                        <SlideToggle
                            isToggled={isToggled}
                            setIsToggled={setIsToggled}
                        />
                        <p
                            className={`${
                                isToggled && 'text-[#905abc]'
                            } font-semibold`}
                        >
                            Mainnet
                        </p>
                        <ShimmerButton
                            className="shadow-2xl"
                            onClick={
                                !isToggled
                                    ? handleGenerateWallet
                                    : handleConnect
                            }
                        >
                            <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                                {isToggled
                                    ? 'Connect Wallet'
                                    : !isToggled && isPending
                                    ? 'Loading...'
                                    : 'Generate Wallet'}
                            </span>
                        </ShimmerButton>
                    </div>
                ) : (
                    <ShimmerButton className=" flex items-center">
                        {isToggled &&
                            (userDetails.profile ? (
                                <img
                                    src={userDetails.profile}
                                    alt="profile"
                                    height={40}
                                    width={40}
                                />
                            ) : (
                                <div className="text-white">Loading...</div>
                            ))}
                        <div
                            className="text-white px-4"
                            onClick={() => {
                                navigator.clipboard.writeText(
                                    userDetails.address
                                );
                                toast.success(
                                    'Address copied to clipboard',
                                    toastStyles
                                );
                            }}
                        >
                            {userDetails.address ||
                                userWallet.addr.slice(0, 6) +
                                    '...' +
                                    userWallet.addr.slice(-6)}
                        </div>

                        <div
                            className="text-white"
                            onClick={async () => {
                                await window.arweaveWallet.disconnect();
                                setUserWallet({ wallet: '', addr: '' });
                                setIsConnected(false);
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="size-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9"
                                />
                            </svg>
                        </div>
                        <div
                            className="text-white ml-3"
                            onClick={() => setOpen(true)}
                        >
                            ...
                        </div>
                    </ShimmerButton>
                )}
            </div>
        </>
    );
};

export default Header;
