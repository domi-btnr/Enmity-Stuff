function r(m){window.enmity.plugins.registerPlugin(m)}function u(m){return window.enmity.patcher.create(m)}window.enmity.modules.common.Constants,window.enmity.modules.common.Clipboard,window.enmity.modules.common.Assets;const y=window.enmity.modules.common.Messages;window.enmity.modules.common.Clyde,window.enmity.modules.common.Avatars,window.enmity.modules.common.Native,window.enmity.modules.common.React,window.enmity.modules.common.Dispatcher,window.enmity.modules.common.Storage,window.enmity.modules.common.Toasts,window.enmity.modules.common.Dialog,window.enmity.modules.common.Token,window.enmity.modules.common.REST,window.enmity.modules.common.Settings,window.enmity.modules.common.Users,window.enmity.modules.common.Navigation,window.enmity.modules.common.NavigationNative,window.enmity.modules.common.NavigationStack,window.enmity.modules.common.Theme,window.enmity.modules.common.Linking,window.enmity.modules.common.StyleSheet,window.enmity.modules.common.ColorMap,window.enmity.modules.common.Components,window.enmity.modules.common.Locale,window.enmity.modules.common.Profiles,window.enmity.modules.common.Lodash,window.enmity.modules.common.Logger,window.enmity.modules.common.Flux,window.enmity.modules.common.SVG,window.enmity.modules.common.Scenes,window.enmity.modules.common.Moment;var p="ReplaceTimestamps",g="1.0.0",h="Replaces plaintext 24 hour timestamps into Discord's timestamps",v=[{name:"HypedDomi",id:"354191516979429376"}],S="#E54B4B",T="https://raw.githubusercontent.com/HypedDomi/Enmity-Stuff/main/dist/ReplaceTimestamps.js",f={name:p,version:g,description:h,authors:v,color:S,sourceUrl:T};const a=u("ReplaceTimestamps"),C={...f,onStart(){const m=d=>{const n=new Date().toISOString().replace(/T/," ").replace(/\..+/,"").replace(/\d?\d:\d\d/,d),t=Math.round(new Date(n).getTime()/1e3);return isNaN(t)?d:`<t:${t}:t>`};a.before(y,"sendMessage",(d,[,n])=>{const t=/(?<!\d)\d{1,2}:\d{2}(?!\d)(am|pm)?/gi,w=/((?<!\d)\d{1,2}:\d{2}(?!\d))(am|pm)?/i;n.content.search(t)!==-1&&(n.content=n.content.replace(t,c=>{let[,i,s]=c.match(w),[e,o]=i.split(":").map(l=>parseInt(l));return s&&s.toLowerCase()==="pm"&&e<12&&e!==0?(e+=12,o=o.toString().padStart(2,"0"),i=`${e}:${o}`):s&&s.toLowerCase()==="am"&&e===12||e===24?i=`00:${o}`:o>=60&&(e+=Math.floor(o/60),o=o%60,i=`${e}:${o}`),m(i)}))})},onStop(){a.unpatchAll()}};r(C);