import {Footer} from './stitch/Footer';
export function SiteFooter(){return <div className="stitch-native"><Footer onSelectTab={tab=>{location.href='/'+tab}}/></div>}
export function ContributionBanner(){return <section className="contribute-strip"><div><span className="banner-kicker">CONTRIBUTE TO THE COMMUNITY</span><h2>Have your school's recent test paper?</h2><p>Share a clear scan and help other students practise for their next exam.</p></div><a href="/upload" className="btn primary">Upload a paper</a></section>}
