import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, Link2, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { validateEmail, validateUsername } from "@/lib/validation";
import { useLanguage } from "@/contexts/LanguageContext";

interface AuthModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [referralCode, setReferralCode] = useState("");
    const [loading, setLoading] = useState(false);
    const { signIn, signUp } = useAuth();
    const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Client-side validation
        const emailValidation = validateEmail(email);
        if (!emailValidation.success) {
                toast.error(emailValidation.error);
                return;
        }
        // Password length check (basic - server does full validation)
        if (password.length < 6) {
                toast.error("Password must be at least 6 characters");
                return;
        }
        if (!isLogin) {
                const usernameValidation = validateUsername(username);
                if (!usernameValidation.success) {
                          toast.error(usernameValidation.error);
                          return;
                }
        }
        setLoading(true);
        try {
                if (isLogin) {
                          const { error } = await signIn(email, password);
                          if (error) {
                                      // Don't expose specific auth errors - could be used for enumeration
                            toast.error("Invalid email or password");
                          } else {
                                      toast.success("Welcome back!");
                                      onOpenChange(false);
                                      resetForm();
                          }
                } else {
                          const { error } = await signUp(email, password, username);
                          if (error) {
                                      // Generic error message for signup failures
                            toast.error("Could not create account. Please try again.");
                          } else {
                                      toast.success("Check your email to verify your account!");
                                      onOpenChange(false);
                                      resetForm();
                          }
                }
        } finally {
                setLoading(false);
        }
  };

  const resetForm = () => {
        setEmail("");
        setPassword("");
        setUsername("");
        setReferralCode("");
  };

  const toggleMode = () => {
        setIsLogin(!isLogin);
        resetForm();
  };

  const handleConnectService = (service: string) => {
        toast.info(`${service} integration coming soon!`);
  };

  return (
        <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                  {/* Connect Services - At the top */}
                        <div className="mb-4">
                                  <div className="flex items-center gap-2 mb-3">
                                              <Link2 className="w-4 h-4 text-muted-foreground" />
                                              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("auth.connectLists")}</span>span>
                                  </div>div>
                                  <div className="flex gap-2">
                                              <Button type="button" variant="outline" size="sm" className="flex-1 gap-2 text-xs" onClick={() => handleConnectService("MyAnimeList")}>
                                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                                            <path d="M8.273 7.247v8.423l-2.103-.003v-5.216l-2.03 2.404-1.989-2.458-.002 5.268H0v-8.42l2.149.003 2.04 2.453 2.033-2.454h2.051zM9.67 15.67V7.247h1.89l.003 8.423H9.67zM14.65 9.025h-3.162v-1.78h8.194v1.778h-3.141v6.645h-1.89l-.001-6.643zM20.18 15.67V7.247h1.89v8.423h-1.89z"/>
                                                            </svg>svg>
                                                            MAL
                                              </Button>Button>
                                              <Button type="button" variant="outline" size="sm" className="flex-1 gap-2 text-xs" onClick={() => handleConnectService("AniList")}>
                                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                                            <path d="M6.361 2.943L0 21.056h4.942l1.077-3.133H11.4l1.052 3.133H22.9c.71 0 1.1-.392 1.1-1.101V17.53c0-.71-.39-1.101-1.1-1.101h-6.483V4.045c0-.71-.392-1.102-1.101-1.102h-2.422c-.71 0-1.101.392-1.101 1.102v1.064l-.758-2.166h-6.45l.776 2.269v-2.27H6.36zm2.324 10.405l1.42-4.5 1.42 4.5H8.685z"/>
                                                            </svg>svg>
                                                            AniList
                                              </Button>Button>
                                              <Button type="button" variant="outline" size="sm" className="flex-1 gap-2 text-xs" onClick={() => handleConnectService("Kitsu")}>
                                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                                            <circle cx="12" cy="12" r="10"/>
                                                            </svg>svg>
                                                            Kitsu
                                              </Button>Button>
                                  </div>div>
                        </div>div>
                
                        <div className="relative">
                                  <div className="absolute inset-0 flex items-center">
                                              <span className="w-full border-t border-border" />
                                  </div>div>
                                  <div className="relative flex justify-center text-xs uppercase">
                                              <span className="bg-background px-2 text-muted-foreground">{t("auth.orSignIn")}</span>span>
                                  </div>div>
                        </div>div>
                
                        <DialogTitle className="text-2xl font-sacred text-center mt-4">
                          {isLogin ? t("auth.welcomeBack") : t("auth.createAccount")}
                        </DialogTitle>DialogTitle>
                        <DialogDescription className="text-center text-muted-foreground">
                          {isLogin ? t("auth.signInDescription") : t("auth.signUpDescription")}
                        </DialogDescription>DialogDescription>
                
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                          {!isLogin && (
                      <div className="space-y-2">
                                    <Label htmlFor="username">{t("auth.username")}</Label>Label>
                                    <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <Input
                                                                        id="username"
                                                                        type="text"
                                                                        placeholder={t("auth.chooseUsername")}
                                                                        value={username}
                                                                        onChange={(e) => setUsername(e.target.value)}
                                                                        className="pl-10"
                                                                        required={!isLogin}
                                                                      />
                                    </div>div>
                      </div>div>
                                  )}
                                  <div className="space-y-2">
                                              <Label htmlFor="email">{t("auth.email")}</Label>Label>
                                              <div className="relative">
                                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                            <Input
                                                                              id="email"
                                                                              type="email"
                                                                              placeholder={t("auth.enterEmail")}
                                                                              value={email}
                                                                              onChange={(e) => setEmail(e.target.value)}
                                                                              className="pl-10"
                                                                              required
                                                                            />
                                              </div>div>
                                  </div>div>
                                  <div className="space-y-2">
                                              <Label htmlFor="password">{t("auth.password")}</Label>Label>
                                              <div className="relative">
                                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                            <Input
                                                                              id="password"
                                                                              type="password"
                                                                              placeholder={t("auth.enterPassword")}
                                                                              value={password}
                                                                              onChange={(e) => setPassword(e.target.value)}
                                                                              className="pl-10"
                                                                              required
                                                                              minLength={6}
                                                                            />
                                              </div>div>
                                  </div>div>
                          {!isLogin && (
                      <div className="space-y-2">
                                    <Label htmlFor="referral" className="text-xs flex items-center gap-1.5">
                                                    <Gift className="w-3 h-3 text-[hsl(45,90%,55%)]" />
                                                    <span className="text-[hsl(45,90%,60%)] font-medium">Founder Code</span>span>
                                                    <span className="text-muted-foreground">(optional — both get 1,000 coins!)</span>span>
                                    </Label>Label>
                                    <Input
                                                      id="referral"
                                                      type="text"
                                                      placeholder="e.g. BIBUE-FOUNDER-A1B2C3"
                                                      value={referralCode}
                                                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                                                      className="font-mono text-sm tracking-wider border-[hsl(45,90%,55%)]/20 focus:border-[hsl(45,90%,55%)]/50"
                                                      maxLength={20}
                                                    />
                      </div>div>
                                  )}
                                  <Button type="submit" className="w-full" disabled={loading}>
                                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    {isLogin ? t("auth.signIn") : t("auth.createAccount")}
                                  </Button>Button>
                        </form>form>
                
                        <div className="relative my-4">
                                  <div className="absolute inset-0 flex items-center">
                                              <span className="w-full border-t border-border" />
                                  </div>div>
                                  <div className="relative flex justify-center text-xs uppercase">
                                              <span className="bg-background px-2 text-muted-foreigmrpoourntd "{> {uts(e"Satuatthe. o}r Cfornotmi n"ureeWaictth"";)
                                                }i<m/psopratn >{
                                                    D i a l o g ,   D i<a/ldoigvC>o
                                              n t e n t ,   D i<a/ldoigvT>i
                                              t
                                              l e ,   D i a l o<gdDievs ccrliapstsiNoanm e}= "ffrloemx  "f@l/ecxo-mcpooln egnatps-/2u"i>/
                                              d i a l o g " ; 
                                               i m<pBourttt o{n 
                                                              B u t t o n   }   f r o mt y"p@e/=c"obmuptotnoenn"t
                                              s / u i / b u t t o n " ;v
                                              airmipaonrtt= "{o uItnlpiunte "}
                                                f r o m   " @ / c o m pcolnaesnstNsa/muei=/"iwn-pfuutl"l; 
                                              giampp-o2r"t
                                                {   L a b e l   }   f roonmC l"i@c/kc=o{mapsoynnecn t(s)/ u=i>/ l{a
                                                  b e l " ; 
                                               i m p o r t   {  cuosnesAtu t{h  e}r rforro m}  "=@ /acwoanitte xstusp/aAbuatsheC.oanuttehx.ts"i;g
                                              niImnpWoirtth O{A uttoha(s{t
                                              }   f r o m   " s o n n e r " ;p
                                              riomvpiodretr :{  "Lgooaodgelre2",, 
                                                M a i l ,   L o c k ,   U s e r ,o pLtiinokn2s,:  G{i
                                                  f t   }   f r o m   " l u c i d e - rreeadcitr"e;c
                                              tiTmop:o rwti n{d oswu.plaobcaastei o}n .forroimg i"n@,/
                                              i n t e g r a t i o n s / s u p a}b,a
                                              s e / c l i e n t " ; 
                                               i m p}o)r;t
                                                {   v a l i d a t e E m a iilf,  (vearlriodra)t e{U
                                                  s e r n a m e   }   f r o m   " @t/olaisbt/.vearlriodra(teirorno"r;.
                                              miemspsoargte ){; 
                                              u s e L a n g u a g e   }   f}r
                                              o m   " @ / c o n t e x t}s}/
                                              L a n g u a g e C o n>t
                                              e x t " ; 
                                               
                                               i n t e r f<ascveg  AcultahsMsoNdaamleP=r"owp-s5  {h
                                                 - 5 "o pveine:w Bbooxo=l"e0a n0; 
                                              2 4  o2n4O"p>e
                                               n C h a n g e :   ( o p e n :< pbaotohl efainl)l =="># 4v2o8i5dF;4
                                               "} 
                                               d
                                               =e"xMp2o2r.t5 6f u1n2c.t2i5ocn0 -A.u7t8h-M.o0d7a-l1(.{5 3o-p.e2n-,2 .o2n5OHp1e2nvC4h.a2n6ghe5 .}9:2 cA-u.t2h6M o1d.a3l7P-r1o.p0s4)  2{.
                                               5 3 -c2o.n2s1t  3[.i3s1Lvo2g.i7n7,h 3s.e5t7Ics2L.o0g8i-n1]. 9=2  u3s.e2S8t-a4t.e7(4t r3u.e2)8;-
                                               8 . 0c9ozn"s/t> 
                                               [ e m a i l ,   s e t E m a i<lp]a t=h  ufsielSlt=a"t#e3(4"A"8)5;3
                                               "   dc=o"nMs1t2  [2p3acs2s.w9o7r d0,  5s.e4t6P-a.s9s8w o7r.d2]8 -=2 .u6s6elS-t3a.t5e7(-"2".)7;7
                                               c - .c9o8n.s6t6 -[2u.s2e3r n1a.m0e6,- 3s.e7t1U s1e.r0n6a-m2e.]8 6=  0u-s5e.S2t9a-t1e.(9"3"-)6;.
                                               1 6 -c4o.n5s3tH 2[.r1e8fve2r.r8a4lCC3o.d9e9,  2s0e.t5R3e f7e.r7r a2l3C o1d2e ]2 3=z "u/s>e
                                               S t a t e ( " " ) ; 
                                                    c o<npsatt h[ lfoialdli=n"g#,F BsBeCt0L5o"a ddi=n"gM]5 .=8 4u s1e4S.t0a9tce-(.f2a2l-s.e6)6;-
                                               . 3 5c-o1n.s3t6 -{. 3s5i-g2n.I0n9,s .s1i3g-n1U.p4 3}. 3=5 -u2s.e0A9uVt7h.(0)7;H
                                               2 . 1c8oCn1s.t4 3{  8t. 5}5  =1  u1s0e.L2a2n g1u a1g2es(.)4;3
                                                
                                               3 . 4c5o n1s.t1 8h a4n.d9l3elS2u.b8m5i-t2 .=2 2a.s8y1n-c. 6(2ez:" /R>e
                                               a c t . F o r m E v e n t )  <=p>a t{h
                                                   f i l le=."p#rEeAv4e3n3t5D"e fda=u"lMt1(2) ;5
                                               . 3 8 c 1c.o6n2s t0  e3m.a0i6l.V5a6l i4d.a2t1i o1n. 6=4 lv3a.l1i5d-a3t.e1E5mCa1i7l.(4e5m a2i.l0)9; 
                                               1 4 . 9 7i f1  (1!2e m1a i7l.V7a l1i d3a.t9i9o n3..s4u7c c2e.s1s8)  7{.
                                               0 7 l 3 . 6 6t o2a.s8t4.ce.r8r7o-r2(.e6m a3i.l3V-a4l.i5d3a t6i.o1n6.-e4r.r5o3rz)";/
                                               > 
                                                         r e t u r n ; 
                                               < / s v g}>
                                               
                                                       i f   ( p a s s w{otr(d".aluetnhg.tshi g<n I6n)W i{t
                                                         h G o o g l et"o)a}s
                                               t . e r r o r ( " P a<s/sBwuotrtdo nm>u
                                               s t   b e   a t   l e<aBsutt t6o nc
                                                                      h a r a c t e r s " ) ; 
                                               t y p e = " bruetttuornn";
                                               
                                                 } 
                                                        i fv a(r!iiasnLto=g"ionu)t l{i
                                                          n e " 
                                                     c o n s t   u s e rcnlaamsesVNaalmied=a"twi-ofnu l=l  vgaalpi-d2a"t
                                               e U s e r n a m e ( u s eornnCalmiec)k;=
                                                 { a s y n c  i(f)  (=!>u s{e
                                                   r n a m e V a l i d a t i o nc.osnusctc e{s se)r r{o
                                                     r   }   =   a w atiota sstu.pearbraosre(.uasuetrhn.asmiegVnaIlniWdiatthiOoAnu.tehr(r{o
                                                       r ) ; 
                                                                r e t u rpnr;o
                                               v i d e r :  }"
                                               a p p l e}"
                                               , 
                                                     s e t L o a d i n g ( t r uoep)t;i
                                               o n s :  t{r
                                                 y   { 
                                                                i f   ( i s L o griend)i r{e
                                                                  c t T o :   w i ncdoonws.tl o{c aetriroonr. o}r i=g ianw,a
                                               i t   s i g n I n ( e m a i l ,  }p,a
                                               s s w o r d ) ; 
                                                 } ) ;i
                                               f   ( e r r o r )   { 
                                                       i f   ( e r r otro)a s{t
                                                         . e r r o r ( " I n v a l i d   etmoaaislt .oerr rpoars(sewrorrodr".)m;e
                                               s s a g e ) ; 
                                                 }   e l s e   { 
                                                 } 
                                                       t o a s t . s u c}c}e
                                               s s ( " W e l c o m e> 
                                               b a c k ! " ) ; 
                                                       < s v g   c loansOspNeanmCeh=a"nwg-e5( fha-l5s"e )v;i
                                               e w B o x = " 0   0  r2e4s e2t4F"o rfmi(l)l;=
                                               " c u r r e n t C}o
                                               l o r " > 
                                                 }   e l s e   { 
                                                             < p a tcho nds=t" M{1 7e.r0r5o r2 0}. 2=8 ca-w.a9i8t. 9s5i-g2n.U0p5(.e8m-a3i.l0,8 .p3a5s-s1w.o0r9d-,. 4u6s-e2r.n0a9m-e.)4;8
                                               - 3 . 2 4   0 - 1i.f4 4(.e6r2r-o2r.)2 .{4
                                                 4 - 3 . 0 6 - . 3 5 Ct2o.a7s9t .1e5r.r2o5r (3".C5o1u l7d. 5n9o t9 .c0r5e a7t.e3 1acc1c.o3u5n.t0.7  P2l.e2a9s.e7 4t r3y. 0a8g.a8i n1.."1)8;-
                                                             . 2 4   2 . 3 1 -}. 9e3l s3e. 5{7
                                                               - . 8 4   1 . 5 1 . 1t2o a2s.t6.5s.u7c2c e3s.s4( "1C.h8e-c3k. 1y2o u1r. 8e7m-a2i.l3 8t o5 .v9e8r.i4f8y  7y.o1u3r- .a5c7c o1u.n5t-!1".)3;1
                                                               2 . 9 9 - 2 . 5 4  o4n.O0p9eln.C0h1a-n.g0e1(zfMa1l2s.e0)3; 
                                                             7 . 2 5 c - . 1 5 - 2r.e2s3e t1F.o6r6m-(4).;0
                                                             7   3 . 7 4 - 4 .}2
                                                             5 . 2 9   2 .}5
                                                             8 - 2 . 3}4  f4i.n5a-l3l.y7 4{ 
                                                               4 . 2 5 z " /s>e
                                                             t L o a d i n g ( f a l s<e/)s;v
                                                             g > 
                                                               } 
                                                               } ; 
                                                              
                                                                  c{otn(s"ta urtehs.estiFgonrImn W=i t(h)A p=p>l e{"
                                                                    ) } 
                                                                 s e t E m a i l (<"/"B)u;t
                                                                 t o n > 
                                                                 s e t P a s s w o<r/dd(i"v">)
                                                                 ;
                                                                 
                                                                          s e t U<sdeirvn acmlea(s"s"N)a;m
                                                                 e = " t esxett-Rceefnetrerra lmCto-d4e"(>"
                                                                 " ) ; 
                                                                   } ; 
                                                                  
                                                                   < bcuotntsotn 
                                                                     t o g g l e M o d e   =  t(y)p e==>" b{u
                                                                       t t o n "s
                                                                 e t I s L o g i n ( ! i soLnoCgliinc)k;=
                                                                   { t o g grleesMeotdFeo}r
                                                                 m ( ) ; 
                                                                   } ; 
                                                                  
                                                                     ccloanssstN ahmaen=d"lteeCxotn-nsemc ttSeexrtv-imcuet e=d -(fsoerrevgircoeu:n ds throivnegr): t=e>x t{-
                                                                       f o r e gtrooausntd. itnrfaon(s`i$t{isoenr-vciocleo}r si"n
                                                                 t e g r a t i o n   c>o
                                                                 m i n g   s o o n ! ` ) ;{
                                                                   i s L}o;g
                                                                 i
                                                                 n   ?r ett(u"ranu t(h
                                                                 . n o A c<cDoiuanltoSgi gonpUepn"=){ o:p etn(}" aountOhp.ehnaCshAacncgoeu=n{toSniOgpneInnC"h)a}n
                                                                 g e } > 
                                                                             <</>DbiuatltoognC>o
                                                                 n t e n t   c l a<s/sdNiavm>e
                                                                 = " s m : m a<x/-Dwi-amldo gmCaoxn-the-n[t9>0
                                                                 v h ]   o<v/eDrifalloowg->y
                                                                 - a u)t;o
                                                                 "}>
                                                                   {/* Connect Services - At the top */}
                                                                         <div className="mb-4">
                                                                                   <div className="flex items-center gap-2 mb-3">
                                                                                               <Link2 className="w-4 h-4 text-muted-foreground" />
                                                                                               <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("auth.connectLists")}</span>span>
                                                                                   </div>div>
                                                                                   <div className="flex gap-2">
                                                                                               <Button type="button" variant="outline" size="sm" className="flex-1 gap-2 text-xs" onClick={() => handleConnectService("MyAnimeList")}>
                                                                                                             <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                                                                                             <path d="M8.273 7.247v8.423l-2.103-.003v-5.216l-2.03 2.404-1.989-2.458-.002 5.268H0v-8.42l2.149.003 2.04 2.453 2.033-2.454h2.051zM9.67 15.67V7.247h1.89l.003 8.423H9.67zM14.65 9.025h-3.162v-1.78h8.194v1.778h-3.141v6.645h-1.89l-.001-6.643zM20.18 15.67V7.247h1.89v8.423h-1.89z"/>
                                                                                                               </svg>svg>
                                                                                                             MAL
                                                                                                 </Button>Button>
                                                                                               <Button type="button" variant="outline" size="sm" className="flex-1 gap-2 text-xs" onClick={() => handleConnectService("AniList")}>
                                                                                                             <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                                                                                             <path d="M6.361 2.943L0 21.056h4.942l1.077-3.133H11.4l1.052 3.133H22.9c.71 0 1.1-.392 1.1-1.101V17.53c0-.71-.39-1.101-1.1-1.101h-6.483V4.045c0-.71-.392-1.102-1.101-1.102h-2.422c-.71 0-1.101.392-1.101 1.102v1.064l-.758-2.166h-6.45l.776 2.269v-2.27H6.36zm2.324 10.405l1.42-4.5 1.42 4.5H8.685z"/>
                                                                                                               </svg>svg>
                                                                                                             AniList
                                                                                                 </Button>Button>
                                                                                               <Button type="button" variant="outline" size="sm" className="flex-1 gap-2 text-xs" onClick={() => handleConnectService("Kitsu")}>
                                                                                                             <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                                                                                             <circle cx="12" cy="12" r="10"/>
                                                                                                               </svg>svg>
                                                                                                             Kitsu
                                                                                                 </Button>Button>
                                                                                   </div>div>
                                                                         </div>div>
                                                                 
                                                                         <div className="relative">
                                                                                   <div className="absolute inset-0 flex items-center">
                                                                                               <span className="w-full border-t border-border" />
                                                                                   </div>div>
                                                                                   <div className="relative flex justify-center text-xs uppercase">
                                                                                               <span className="bg-background px-2 text-muted-foreground">{t("auth.orSignIn")}</span>span>
                                                                                   </div>div>
                                                                         </div>div>
                                                                 
                                                                         <DialogTitle className="text-2xl font-sacred text-center mt-4">
                                                                           {isLogin ? t("auth.welcomeBack") : t("auth.createAccount")}
                                                                         </DialogTitle>DialogTitle>
                                                                         <DialogDescription className="text-center text-muted-foreground">
                                                                           {isLogin ? t("auth.signInDescription") : t("auth.signUpDescription")}
                                                                         </DialogDescription>DialogDescription>
                                                                 
                                                                         <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                                                                           {!isLogin && (
                                                                           <div className="space-y-2">
                                                                                         <Label htmlFor="username">{t("auth.username")}</Label>Label>
                                                                                         <div className="relative">
                                                                                                         <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                                                                         <Input id="username" type="text" placeholder={t("auth.chooseUsername")} value={username} onChange={(e) => setUsername(e.target.value)} className="pl-10" required={!isLogin} />
                                                                                           </div>div>
                                                                           </div>div>
                                                                                   )}
                                                                                   <div className="space-y-2">
                                                                                               <Label htmlFor="email">{t("auth.email")}</Label>Label>
                                                                                               <div className="relative">
                                                                                                             <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                                                                             <Input id="email" type="email" placeholder={t("auth.enterEmail")} value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                                                                                                 </div>div>
                                                                                   </div>div>
                                                                                   <div className="space-y-2">
                                                                                               <Label</DialogContent>
