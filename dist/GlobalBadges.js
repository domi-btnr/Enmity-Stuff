function x(t,o,i){window.enmity.settings.set(t,o,i)}function F(t,o,i){return window.enmity.settings.get(t,o,i)}const{components:e}=window.enmity;e.Alert,e.Button,e.FlatList;const R=e.Image;e.ImageBackground,e.KeyboardAvoidingView,e.Modal,e.Pressable,e.RefreshControl;const I=e.ScrollView;e.SectionList,e.StatusBar,e.StyleSheet,e.Switch;const g=e.Text;e.TextInput,e.TouchableHighlight;const j=e.TouchableOpacity;e.TouchableWithoutFeedback,e.Touchable;const p=e.View;e.VirtualizedList,e.Form,e.FormArrow,e.FormCTA,e.FormCTAButton,e.FormCardSection,e.FormCheckbox,e.FormDivider,e.FormHint,e.FormIcon,e.FormInput,e.FormLabel,e.FormRadio;const c=e.FormRow,D=e.FormSection;e.FormSelect,e.FormSubLabel;const M=e.FormSwitch;e.FormTernaryCheckBox,e.FormText,e.FormTextColors,e.FormTextSizes;function O(t){window.enmity.plugins.registerPlugin(t)}function N(...t){return window.enmity.modules.getByProps(...t)}function V(...t){return window.enmity.modules.getByName(...t)}window.enmity.modules.common;const w=window.enmity.modules.common.Constants;window.enmity.modules.common.Clipboard,window.enmity.modules.common.Assets,window.enmity.modules.common.Messages,window.enmity.modules.common.Clyde,window.enmity.modules.common.Avatars,window.enmity.modules.common.Native;const n=window.enmity.modules.common.React;window.enmity.modules.common.Dispatcher,window.enmity.modules.common.Storage;const H=window.enmity.modules.common.Toasts,v=window.enmity.modules.common.Dialog;window.enmity.modules.common.Token,window.enmity.modules.common.REST,window.enmity.modules.common.Settings,window.enmity.modules.common.Users;const Y=window.enmity.modules.common.Navigation;window.enmity.modules.common.NavigationNative,window.enmity.modules.common.NavigationStack,window.enmity.modules.common.Theme,window.enmity.modules.common.Linking;const z=window.enmity.modules.common.StyleSheet;window.enmity.modules.common.ColorMap,window.enmity.modules.common.Components,window.enmity.modules.common.Locale,window.enmity.modules.common.Profiles,window.enmity.modules.common.Lodash,window.enmity.modules.common.Logger,window.enmity.modules.common.Flux,window.enmity.modules.common.SVG,window.enmity.modules.common.Scenes,window.enmity.modules.common.Moment;function G(t){return window.enmity.patcher.create(t)}var r="GlobalBadges",l="1.0.0",K="Adds global badges from other client mods",_=[{name:"HypedDomi",id:"354191516979429376"}],W="#E54B4B",C="https://raw.githubusercontent.com/HypedDomi/Enmity-Stuff/main/dist/GlobalBadges.js",A="https://raw.githubusercontent.com/HypedDomi/Enmity-Stuff/main/dist/GlobalBadges.js",b=["Initial Release"],s={name:r,version:l,description:K,authors:_,color:W,rawUrl:C,sourceUrl:A,changelog:b};const{native:h}=window.enmity;function X(){h.reload()}h.version,h.build,h.device,h.version;async function L(){let t=(await(await fetch(`${C}?${Math.random()}`)).text()).match(/\d\.\d\.\d+/g);if(!(t!=null&&t.length))return!1;t=t[0].replace('"',""),t=t.split(".").map(i=>parseInt(i));const o=l.split(".").map(i=>parseInt(i));return t[0]>o[0]||t[0]==o[0]&&t[1]>o[1]?!0:t[0]==o[0]&&t[1]==o[1]&&t[2]>o[2]}const q=t=>{let o=[];fetch(t).then(i=>i.text()).then(i=>o=i.match(/\d\.\d\.\d+/g)),window.enmity.plugins.installPlugin(t,({data:i})=>{i=="installed_plugin"||i=="overridden_plugin"?v.show({title:`Updated ${r}`,body:`Successfully updated to version **${o!=null&&o.length?o[0]:l}**. Would you like to reload Discord now?`,confirmText:"Reload",cancelText:"Later",onConfirm:()=>X()}):console.log(`[${r}] Plugin failed to update to version ${l}`)})};function U(){v.show({title:"Plugin Updater",body:`**${r}** has an update. Do you want to update now?`,confirmText:"Update",cancelText:"No",onConfirm:()=>{x(r,"_didUpdate",!0),q(`${C}?${Math.random()}`)}})}function P(){!b.length||v.show({title:`${r} - v${l}`,body:`- ${b.join(`
- `)}`,confirmText:"OK",onConfirm:()=>x(r,"_changelog",l)})}const B=N("transitionToGuild");var J=({settings:t})=>{const o=z.createThemedStyleSheet({item:{color:w.ThemeColorMap.TEXT_MUTED},text_container:{paddingLeft:15,paddingTop:5,flexDirection:"column",flexWrap:"wrap"},main_text:{opacity:.975,letterSpacing:.25},header:{color:w.ThemeColorMap.HEADER_PRIMARY,fontFamily:w.Fonts.DISPLAY_BOLD,fontSize:25,letterSpacing:.25},sub_header:{color:w.ThemeColorMap.HEADER_SECONDARY,opacity:.975,fontSize:12.75}}),[i,d]=n.useState(),[m,u]=n.useState();return n.createElement(n.Fragment,null,n.createElement(I,{onTouchStart:a=>{d(a.nativeEvent.pageX),u(a.nativeEvent.pageY)},onTouchEnd:a=>{i-a.nativeEvent.pageX<-100&&m-a.nativeEvent.pageY<40&&m-a.nativeEvent.pageY>-40&&Y.pop()}},n.createElement(p,null,n.createElement(p,{style:o.text_container},n.createElement(g,{style:[o.main_text,o.header]},r),n.createElement(p,{style:{flexDirection:"row"}},n.createElement(g,{style:[o.main_text,o.sub_header]},"Author:"),n.createElement(g,{style:[o.main_text,o.sub_header,{paddingLeft:4,fontFamily:w.Fonts.DISPLAY_BOLD}]},` ${_.map(a=>a.name).join(", ")}`)),n.createElement(p,{style:{flexDirection:"row"}},n.createElement(g,{style:[o.main_text,o.sub_header]},"Version:"),n.createElement(g,{style:[o.main_text,o.sub_header,{paddingLeft:4,fontFamily:w.Fonts.DISPLAY_BOLD}]},` ${l}`)))),n.createElement(D,{title:"Updates"},n.createElement(c,{label:"Check for Updates on startup",subLabel:"Checks automatically for updates when starting the Plugin",trailing:n.createElement(M,{value:t.getBoolean("autoUpdateCheck",!0),onValueChange:()=>t.toggle("autoUpdateCheck",!0)})}),n.createElement(c,{label:"Check for Updates",trailing:c.Arrow,onPress:()=>{L().then(a=>{a?U():v.show({title:"Plugin Updater",body:`**${r}** is already on the latest version (**${l}**)`,confirmText:"OK"})})}}),n.createElement(c,{label:"Show Changelog",subLabel:`Shows the changelog for v${l}`,trailing:c.Arrow,onPress:()=>P(),disabled:!b.length})),n.createElement(D,{title:"Source"},n.createElement(c,{label:"Source",subLabel:`See the Source Code for ${r}`,trailing:c.Arrow,onPress:()=>B==null?void 0:B.openURL(A)}))))};const S=new Map,Q=1e3*60*15,$={aliu:{dev:{name:"Aliucord Developer",img:"https://cdn.discordapp.com/emojis/860599530956783656.png"},donor:{name:"Aliucord Donor",img:"https://cdn.discordapp.com/emojis/859801776232202280.png"},contributor:{name:"Aliucord Contributor",img:"https://cdn.discordapp.com/emojis/894346480943530015.png"}},bd:{dev:{name:"BetterDiscord Developer",img:"https://cdn.discordapp.com/emojis/1019671156523012136.png"}}},Z=(t,o)=>{var i,d;!S.has(t)||((i=S.get(t))==null?void 0:i.expires)<Date.now()?fetch(`https://api.obamabot.me/v2/text/badges?user=${t}`).then(m=>m.json()).then(m=>{S.set(t,{badges:m,expires:Date.now()+Q}),o(m)}):o((d=S.get(t))==null?void 0:d.badges)},ee=({name:t,img:o})=>{const i={wrapper:{alignItems:"center",flexDirection:"row",justifyContent:"flex-end"},image:{width:24,height:24,resizeMode:"contain",marginHorizontal:2}};return n.createElement(p,{style:i.wrapper},n.createElement(j,{onPress:()=>H.open({content:t,source:{uri:o}})},n.createElement(R,{style:i.image,source:{uri:o}})))},k=G(s.name),te={...s,onStart(){F(s.name,"_didUpdate",!1)||(F(s.name,"autoUpdateCheck",!0)&&L().then(o=>{o&&U()}),F(s.name,"_changelog",s.version)!==s.version&&P()),x(s.name,"_didUpdate",!1);const t=V("ProfileBadges",{all:!0,default:!1});for(const o of t)k.after(o,"default",(i,[{user:{id:d}}],m)=>{const[u,a]=n.useState({});if(n.useEffect(()=>Z(d,a),[]),Object.keys(u).length===0&&u.constructor===Object)return;const y=[];for(const E in u){const T=u[E];for(const f in T)T[f]&&typeof T[f]!="object"&&y.push(n.createElement(ee,{name:$[E][f].name,img:$[E][f].img}))}if(console.log(y),!y.length)return m;m.props.children=[...m.props.children,...y]})},onStop(){k.unpatchAll()},getSettingsPanel({settings:t}){return n.createElement(J,{settings:t})}};O(te);