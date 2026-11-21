import { Composition } from "remotion";
import { CityScene } from "./CityScene";
import cityData from "../data/buildings_processed.json";

// 30 fps, 15 seconds = 450 frames (Shorts 9:16 vertical)
const FPS = 30;
const DURATION_IN_FRAMES = 15 * FPS;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CityTimelapse"
        component={CityScene}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{
          buildings: cityData.buildings,
          bounds: cityData.bounds,
        }}
      />
    </>
  );
};