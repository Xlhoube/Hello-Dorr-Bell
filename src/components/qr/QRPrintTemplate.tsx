import { QRCodeSVG } from 'qrcode.react';
import { BellRing, User } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { useTranslation } from 'react-i18next';

interface QRPrintTemplateProps {
    template: 'classic' | 'dark' | 'minimal' | 'corporate' | 'mini_cards';
    unitName: string;
    propertyName: string;
    qrValue: string;
    orgLogo?: string;
}

export function QRPrintTemplate({ template, unitName, propertyName, qrValue, orgLogo }: QRPrintTemplateProps) {
    const { t } = useTranslation();
    if (template === 'dark') {
        return (
            <div className="w-[210mm] h-[297mm] bg-slate-950 text-white p-10 flex flex-col items-center justify-between text-center font-sans print:m-0" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                <div className="w-full">
                    <div className="flex flex-col items-center justify-center mb-20 animate-in zoom-in duration-1000 scale-[2.5]">
                        <Logo size="lg" />
                    </div>
                    <h1 className="text-7xl font-black uppercase tracking-tighter mb-4 text-blue-500">{unitName}</h1>
                    <p className="text-2xl text-slate-400 font-bold uppercase tracking-[4px]">{propertyName}</p>
                </div>

                <div className="flex flex-col items-center gap-10">
                    <div className="p-8 bg-white rounded-[3rem] shadow-[0_0_100px_rgba(59,130,246,0.2)] border-8 border-slate-900">
                        <QRCodeSVG 
                            value={qrValue} 
                            size={350} 
                            level="H" 
                            includeMargin={true}
                            imageSettings={orgLogo ? {
                                src: orgLogo,
                                x: undefined,
                                y: undefined,
                                height: 60,
                                width: 60,
                                excavate: true,
                            } : undefined}
                        />
                    </div>
                    <div className="space-y-4">
                        <p className="text-3xl font-black uppercase tracking-widest text-white">{t('qr_print.scan_to_enter')}</p>
                        <p className="text-xl text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
                            {t('qr_print.scan_instruction')}
                        </p>
                        <p className="text-2xl text-blue-400 font-bold mt-4 italic">
                            {t('qr_print.contact_instruction')}
                        </p>
                    </div>
                </div>

                <div className="w-full border-t border-slate-800 pt-10 flex justify-between items-center opacity-70">
                    <div className="flex items-center gap-4 text-left">
                        <div className="bg-white p-1 rounded-md"><QRCodeSVG value="https://hellodoorbell.com" size={45} level="L" /></div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">{t('qr_print.learn_more')}</p>
                            <p className="text-[10px] text-white mt-1 tracking-widest">hellodoorbell.com</p>
                        </div>
                    </div>
                    {orgLogo && <img src={orgLogo} alt="Logo" className="h-10 grayscale invert" />}
                </div>
            </div>
        );
    }

    if (template === 'minimal') {
        return (
            <div className="w-[210mm] h-[297mm] bg-white text-black p-12 flex flex-col items-center justify-center text-center font-sans print:m-0" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                <div className="w-full flex justify-between items-start mb-16">
                    <Logo size="lg" />
                    {orgLogo && <img src={orgLogo} alt="Logo" className="h-12 object-contain grayscale" />}
                </div>

                <div className="mb-14">
                    <h1 className="text-6xl font-light tracking-tight mb-2">{unitName}</h1>
                    <div className="h-1 w-20 bg-black mx-auto"></div>
                </div>

                <div className="mb-20">
                    <QRCodeSVG 
                        value={qrValue} 
                        size={400} 
                        level="H" 
                        includeMargin={true}
                        imageSettings={orgLogo ? {
                            src: orgLogo,
                            x: undefined,
                            y: undefined,
                            height: 70,
                            width: 70,
                            excavate: true,
                        } : undefined}
                    />
                </div>

                <div className="space-y-2 mb-16">
                    <p className="text-sm font-black uppercase tracking-[5px] text-slate-400">{t('qr_print.scan_to_ring')}</p>
                    <p className="text-lg font-medium text-slate-600">{propertyName}</p>
                    <p className="text-sm font-bold text-slate-400 mt-4">
                        {t('qr_print.contact_instruction')}
                    </p>
                </div>

                <div className="w-full mt-auto border-t border-slate-200 pt-10 flex justify-between items-center text-left">
                    <div className="flex items-center gap-4">
                        <QRCodeSVG value="https://hellodoorbell.com" size={45} level="L" />
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{t('qr_print.intelligence_by')}</p>
                            <p className="text-[10px] text-slate-400 mt-1 tracking-widest">hellodoorbell.com</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (template === 'corporate') {
        return (
            <div className="w-[210mm] h-[297mm] bg-slate-50 text-[#1e293b] p-0 flex flex-col items-center font-sans print:m-0 overflow-hidden" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                <div className="w-full h-8 bg-blue-600"></div>
                <div className="p-20 w-full flex flex-col items-center flex-1 justify-between">
                    <div className="w-full flex justify-between items-start">
                        <div className="text-left flex items-center gap-10">
                            <div className="scale-[2] origin-left ml-6 mr-10 drop-shadow-xl">
                                <Logo size="lg" />
                            </div>
                            <div>
                                <h1 className="text-8xl font-black text-blue-600 uppercase tracking-tighter leading-none">{unitName}</h1>
                                <p className="text-4xl font-bold text-slate-400 uppercase tracking-[4px] mt-4">{propertyName}</p>
                            </div>
                        </div>
                        {orgLogo && <img src={orgLogo} alt="Logo" className="w-32 h-32 object-contain opacity-50" />}
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-600/5 blur-[120px] rounded-full scale-150"></div>
                        <div className="relative p-10 bg-white rounded-3xl shadow-xl border border-slate-200">
                            <QRCodeSVG 
                                value={qrValue} 
                                size={380} 
                                level="H" 
                                includeMargin={true}
                                imageSettings={orgLogo ? {
                                    src: orgLogo,
                                    x: undefined,
                                    y: undefined,
                                    height: 65,
                                    width: 65,
                                    excavate: true,
                                } : undefined}
                            />
                        </div>
                    </div>

                    <div className="w-full bg-white p-12 rounded-[2rem] border border-slate-200 shadow-sm flex justify-between items-center gap-10 text-left mb-10">
                        <div className="flex items-center gap-10">
                            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/30">
                                <BellRing className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <p className="text-3xl font-black uppercase tracking-tight text-slate-800">{t('qr_print.visitors')}</p>
                                <p className="text-xl text-slate-500 font-medium mb-2">{t('qr_print.visitors_instruction')}</p>
                                <p className="text-lg font-bold text-blue-600 italic">
                                    {t('qr_print.contact_instruction')}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="w-full flex justify-between items-center">
                        <div className="flex items-center gap-4 text-left p-4 bg-slate-100 rounded-2xl border border-slate-200">
                            <QRCodeSVG value="https://hellodoorbell.com" size={50} level="L" />
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">{t('qr_print.system_powered_by')}</p>
                                <p className="text-sm font-black text-slate-700 mt-0.5 tracking-tight uppercase">hellodoorbell.com</p>
                            </div>
                        </div>
                        <p className="text-xs font-bold uppercase tracking-[4px] text-slate-400">{t('qr_print.secure_flow', { defaultValue: 'P2P Encrypted Secure Flow' })}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (template === 'mini_cards') {
        const cards = Array(10).fill(null); // 5 rows x 2 cols
        return (
            <div className="w-[210mm] h-[297mm] bg-white text-slate-900 p-[10mm] flex flex-wrap content-start font-sans print:m-0" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', gap: '5mm' }}>
                {cards.map((_, i) => (
                    <div key={i} className="w-[85mm] h-[50mm] bg-white border border-slate-300 rounded-xl flex flex-row items-center p-3">
                        <div className="pr-3 border-r border-slate-200 h-full flex items-center">
                            <QRCodeSVG 
                                value={qrValue} 
                                size={105} 
                                level="H" 
                                includeMargin={false}
                                imageSettings={orgLogo ? {
                                    src: orgLogo,
                                    x: undefined,
                                    y: undefined,
                                    height: 20,
                                    width: 20,
                                    excavate: true,
                                } : undefined}
                            />
                        </div>
                        <div className="pl-3 flex flex-col justify-center h-full flex-1 overflow-hidden">
                            <div className="mb-2 scale-75 origin-left">
                                <Logo size="sm" />
                            </div>
                            <h2 className="text-lg font-black uppercase tracking-tighter text-blue-600 truncate leading-tight mb-1">{unitName}</h2>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[1px] truncate">{propertyName}</p>
                            <div className="mt-2 text-[7px] text-slate-400 font-medium leading-tight">
                                {t('qr_print.point_camera')}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Default: 'classic'
    return (
        <div className="w-[210mm] h-[297mm] bg-white text-slate-900 p-10 flex flex-col items-center justify-between text-center font-sans print:m-0 border-[30px] border-blue-600" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
            <div className="pt-10">
                <div className="flex flex-col items-center justify-center mb-16 scale-[2.5] mt-10">
                    <Logo size="lg" />
                </div>
                <h1 className="text-8xl font-black uppercase tracking-tighter mb-4">{unitName}</h1>
                <p className="text-2xl text-blue-500 font-black uppercase tracking-[3px] border-y-2 border-blue-100 py-4 inline-block px-10">{propertyName}</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-2xl border-4 border-slate-50 scale-110">
                <QRCodeSVG 
                    value={qrValue} 
                    size={320} 
                    level="H" 
                    includeMargin={true}
                    imageSettings={orgLogo ? {
                        src: orgLogo,
                        x: undefined,
                        y: undefined,
                        height: 55,
                        width: 55,
                        excavate: true,
                    } : undefined}
                />
            </div>

            <div className="pb-10">
                <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-4 bg-slate-100 px-8 py-4 rounded-2xl border border-slate-200">
                        <User className="w-8 h-8 text-blue-600" />
                        <p className="text-2xl font-black uppercase tracking-tight">{t('qr_print.identify_to_enter')}</p>
                    </div>
                    <p className="text-lg text-slate-400 font-bold uppercase tracking-[2px] mb-4">{t('qr_print.no_apps_no_wait')}</p>
                    <p className="text-xl text-blue-600 font-black uppercase tracking-wider mb-10">
                        {t('qr_print.contact_instruction')}
                    </p>
                </div>
                
                <div className="w-full flex justify-center items-center gap-4 opacity-80 bg-blue-50/50 p-4 rounded-xl">
                    <QRCodeSVG value="https://hellodoorbell.com" size={40} level="L" />
                    <div className="text-left">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">{t('qr_print.powered_by', { defaultValue: 'Powered By' })}</p>
                        <p className="text-sm font-black text-slate-700 mt-0.5 tracking-tight">hellodoorbell.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
