// Mascot component - used for success, error & loading
import Svg, {
  Circle,
  Ellipse,
  Line,
  Path,
  Rect,
  Text as SvgText,
} from "react-native-svg";

export type MascotMood = "happy" | "sad" | "excited" | "sleeping";

type MascotProps = {
  mood: MascotMood;
  size?: number;
};

function MascotBase({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Ellipse
        cx={190}
        cy={300}
        rx={95}
        ry={14}
        fill="#3a7d3a"
        opacity={0.12}
      />

      <Path
        d="M150 75 Q150 50 168 42 Q172 28 184 32 Q190 18 200 28 Q214 26 212 42 Q230 46 228 68"
        fill="none"
        stroke="#3a7d3a"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Path
        d="M188 75 Q175 55 158 52 Q172 62 180 80 Q186 64 188 75Z"
        fill="#5fa85f"
      />
      <Path
        d="M192 75 Q205 50 226 46 Q210 58 202 80 Q196 62 192 75Z"
        fill="#76bf76"
      />
      <Path
        d="M190 80 L190 58"
        stroke="#3a7d3a"
        strokeWidth={2.5}
        strokeLinecap="round"
      />

      <Path
        d="M118 110 L190 85 L262 110 L262 230 Q262 242 250 242 L130 242 Q118 242 118 230 Z"
        fill="#d4a574"
      />
      <Path d="M118 110 L190 85 L262 110 L190 132 Z" fill="#e8c9a0" />
      <Path
        d="M118 110 L190 132 L190 242 L130 242 Q118 242 118 230 Z"
        fill="#c89860"
      />
      <Path
        d="M262 110 L190 132 L190 242 L250 242 Q262 242 262 230 Z"
        fill="#d4a574"
      />
      <Line
        x1={190}
        y1={132}
        x2={190}
        y2={242}
        stroke="#a87f4f"
        strokeWidth={1.5}
        opacity={0.5}
      />
      <Path
        d="M150 100 L190 114 L230 100"
        fill="none"
        stroke="#a87f4f"
        strokeWidth={1.5}
        opacity={0.5}
        strokeLinecap="round"
      />

      <Path
        d="M150 242 L150 272 Q150 280 158 280 L168 280 Q176 280 176 272 L176 242 Z"
        fill="#c89860"
      />
      <Path
        d="M204 242 L204 272 Q204 280 212 280 L222 280 Q230 280 230 272 L230 242 Z"
        fill="#c89860"
      />

      {children}
    </>
  );
}

function HappyFace() {
  return (
    <>
      <Path
        d="M118 180 Q92 172 80 148"
        fill="none"
        stroke="#c89860"
        strokeWidth={13}
        strokeLinecap="round"
      />
      <Path
        d="M262 180 Q288 188 300 168"
        fill="none"
        stroke="#d4a574"
        strokeWidth={13}
        strokeLinecap="round"
      />
      <Circle cx={80} cy={146} r={9} fill="#c89860" />
      <Circle cx={301} cy={166} r={9} fill="#d4a574" />

      <Rect x={148} y={158} width={22} height={22} rx={11} fill="#3a3028" />
      <Rect x={210} y={158} width={22} height={22} rx={11} fill="#3a3028" />
      <Circle cx={156} cy={165} r={4} fill="#fff" />
      <Circle cx={218} cy={165} r={4} fill="#fff" />
      <Circle cx={142} cy={192} r={9} fill="#e89a8a" opacity={0.55} />
      <Circle cx={238} cy={192} r={9} fill="#e89a8a" opacity={0.55} />
      <Path
        d="M170 198 Q190 216 210 198"
        fill="none"
        stroke="#3a3028"
        strokeWidth={3.5}
        strokeLinecap="round"
      />
    </>
  );
}

function SadFace() {
  return (
    <>
      <Path
        d="M118 180 Q94 192 84 212"
        fill="none"
        stroke="#c89860"
        strokeWidth={13}
        strokeLinecap="round"
      />
      <Path
        d="M262 180 Q286 192 296 212"
        fill="none"
        stroke="#d4a574"
        strokeWidth={13}
        strokeLinecap="round"
      />
      <Circle cx={84} cy={214} r={9} fill="#c89860" />
      <Circle cx={296} cy={214} r={9} fill="#d4a574" />

      <Path
        d="M148 163 Q159 156 170 163"
        fill="none"
        stroke="#3a3028"
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      <Path
        d="M210 163 Q221 156 232 163"
        fill="none"
        stroke="#3a3028"
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      <Circle cx={160} cy={176} r={3.5} fill="#8fb4d9" />
      <Path
        d="M160 179 Q156 194 161 204"
        fill="none"
        stroke="#8fb4d9"
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      <Circle cx={161} cy={205} r={3} fill="#8fb4d9" />
      <Circle cx={142} cy={192} r={9} fill="#e89a8a" opacity={0.45} />
      <Circle cx={238} cy={192} r={9} fill="#e89a8a" opacity={0.45} />
      <Path
        d="M170 210 Q190 194 210 210"
        fill="none"
        stroke="#3a3028"
        strokeWidth={3.5}
        strokeLinecap="round"
      />
    </>
  );
}

function ExcitedFace() {
  return (
    <>
      <Path
        d="M134 36 L137 46 M246 36 L243 46 M190 24 L190 36"
        stroke="#f5b400"
        strokeWidth={3}
        strokeLinecap="round"
      />

      <Path
        d="M118 180 Q92 164 84 138"
        fill="none"
        stroke="#c89860"
        strokeWidth={13}
        strokeLinecap="round"
      />
      <Path
        d="M262 180 Q288 164 296 138"
        fill="none"
        stroke="#d4a574"
        strokeWidth={13}
        strokeLinecap="round"
      />
      <Circle cx={84} cy={136} r={9} fill="#c89860" />
      <Circle cx={296} cy={136} r={9} fill="#d4a574" />

      <Path d="M150 158 L166 168 L150 178Z" fill="#3a3028" />
      <Path d="M230 158 L214 168 L230 178Z" fill="#3a3028" />
      <Circle cx={140} cy={192} r={10} fill="#e89a8a" opacity={0.65} />
      <Circle cx={240} cy={192} r={10} fill="#e89a8a" opacity={0.65} />
      <Path d="M168 194 Q190 220 212 194 Q190 208 168 194Z" fill="#3a3028" />
    </>
  );
}

function SleepingFace() {
  return (
    <>
      <Path
        d="M118 180 Q94 190 84 208"
        fill="none"
        stroke="#c89860"
        strokeWidth={13}
        strokeLinecap="round"
      />
      <Path
        d="M262 180 Q286 190 296 208"
        fill="none"
        stroke="#d4a574"
        strokeWidth={13}
        strokeLinecap="round"
      />
      <Circle cx={84} cy={210} r={9} fill="#c89860" />
      <Circle cx={296} cy={210} r={9} fill="#d4a574" />

      <Path
        d="M148 169 Q159 176 170 169"
        fill="none"
        stroke="#3a3028"
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      <Path
        d="M210 169 Q221 176 232 169"
        fill="none"
        stroke="#3a3028"
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      <Circle cx={142} cy={192} r={9} fill="#e89a8a" opacity={0.5} />
      <Circle cx={238} cy={192} r={9} fill="#e89a8a" opacity={0.5} />
      <Ellipse cx={190} cy={202} rx={8} ry={11} fill="#3a3028" />

      <SvgText x={276} y={130} fill="#8fb4d9" fontSize={14} fontWeight="500">
        z
      </SvgText>
      <SvgText x={290} y={108} fill="#8fb4d9" fontSize={18} fontWeight="500">
        z
      </SvgText>
      <SvgText x={306} y={84} fill="#8fb4d9" fontSize={24} fontWeight="500">
        z
      </SvgText>
    </>
  );
}

const FACES: Record<MascotMood, () => React.JSX.Element> = {
  happy: HappyFace,
  sad: SadFace,
  excited: ExcitedFace,
  sleeping: SleepingFace,
};

export function Mascot({ mood, size = 160 }: MascotProps) {
  const Face = FACES[mood];
  const height = (size / 380) * 320;

  return (
    <Svg width={size} height={height} viewBox="0 0 380 320" fill="none">
      <MascotBase>
        <Face />
      </MascotBase>
    </Svg>
  );
}
