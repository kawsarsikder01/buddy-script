import Image from "next/image";
interface ShapeImages {
    lightShape: string;
    darkShape: string;
}

export default function Shape({shapeClass, shapeImages}: {shapeClass?: string, shapeImages?: ShapeImages}) {
    return (
        <div className={`${shapeClass || ""}`}>
            <Image src={`/assets/images/${shapeImages?.lightShape || "shape1.svg"}`} alt="" className="_shape_img" width={100} height={100} />
            <Image src={`/assets/images/${shapeImages?.darkShape || "dark_shape.svg"}`} alt="" className="_dark_shape" width={100} height={100} />
        </div>
    )
}