import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Avatar from "./post/Avatar";
import type { Author } from "./post/types";

export default function MakePost() {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    // State
    const [text, setText] = useState("");
    const [visibility, setVisibility] = useState<"public" | "private">("public");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch current user
    const { data: userData } = useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            const res = await axios.get("/api/post/me");
            return res.data.user as Author;
        }
    });

    // Post mutation
    const postMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const res = await axios.post("/api/post", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return res.data;
        },
        onSuccess: () => {
            // Clear form
            setText("");
            setSelectedImage(null);
            setImagePreview(null);
            setVisibility("public");
            // Refresh feed
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
        onError: (err) => {
            console.error("Failed to create post", err);
            alert("Failed to create post. Please try again.");
        }
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!text.trim() && !selectedImage) return;

        const formData = new FormData();
        formData.append("text", text);
        formData.append("visibility", visibility);
        if (selectedImage) {
            formData.append("image", selectedImage);
        }

        postMutation.mutate(formData);
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="_feed_inner_text_area  _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16">
            <div className="_feed_inner_text_area_box" style={{ alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div className="_feed_inner_text_area_box_image">
                        {userData ? (
                            <Avatar author={userData} size="lg" />
                        ) : (
                            <img src="assets/images/txt_img.png" alt="Image" className="_txt_img" />
                        )}
                    </div>
                </div>

                <div className="form-floating _feed_inner_text_area_box_form" style={{ flex: 1, marginLeft: 16 }}>
                    <textarea 
                        className="form-control _textarea" 
                        placeholder="Leave a comment here" 
                        id="floatingTextarea"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        style={{ height: '80px', border: 'none', boxShadow: 'none', fontSize: '18px', fontWeight: 500, color: '#333' }}
                    ></textarea>
                    {/* The label placeholder logic from the original design */}
                    {!text && (
                        <label className="_feed_textarea_label" htmlFor="floatingTextarea" style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.7, padding: '12px 0' }}>
                            <span style={{ fontSize: '18px', fontWeight: 500 }}>Write something ...</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                            </svg>
                        </label>
                    )}
                </div>
            </div>

            {/* Image Preview */}
            {imagePreview && (
                <div style={{ position: 'relative', marginTop: 16, maxWidth: '200px' }}>
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', borderRadius: '8px' }} />
                    <button 
                        onClick={removeImage}
                        style={{
                            position: 'absolute', top: -8, right: -8,
                            width: 24, height: 24, borderRadius: '50%',
                            background: 'rgba(0,0,0,0.6)', color: 'white',
                            border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        &times;
                    </button>
                </div>
            )}

            {/* Hidden File Input */}
            <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                style={{ display: 'none' }} 
            />

            {/* Submission Area */}
            <div className="_feed_inner_text_area_bottom" style={{ background: '#f0f7ff', padding: '12px 16px', borderRadius: '4px', margin: '0 -24px -24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="_feed_inner_text_area_item" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="_feed_inner_text_area_bottom_photo _feed_common">
                        <button 
                            type="button" 
                            className="_feed_inner_text_area_bottom_photo_link"
                            onClick={() => fileInputRef.current?.click()}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontWeight: 500 }}
                        > 
                            <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img"> 
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
                                    <path fill="#666" d="M13.916 0c3.109 0 5.18 2.429 5.18 5.914v8.17c0 3.486-2.072 5.916-5.18 5.916H5.999C2.89 20 .827 17.572.827 14.085v-8.17C.827 2.43 2.897 0 6 0h7.917zm0 1.504H5.999c-2.321 0-3.799 1.735-3.799 4.41v8.17c0 2.68 1.472 4.412 3.799 4.412h7.917c2.328 0 3.807-1.734 3.807-4.411v-8.17c0-2.678-1.478-4.411-3.807-4.411zm.65 8.68l.12.125 1.9 2.147a.803.803 0 01-.016 1.063.642.642 0 01-.894.058l-.076-.074-1.9-2.148a.806.806 0 00-1.205-.028l-.074.087-2.04 2.717c-.722.963-2.02 1.066-2.86.26l-.111-.116-.814-.91a.562.562 0 00-.793-.07l-.075.073-1.4 1.617a.645.645 0 01-.97.029.805.805 0 01-.09-.977l.064-.086 1.4-1.617c.736-.852 1.95-.897 2.734-.137l.114.12.81.905a.587.587 0 00.861.033l.07-.078 2.04-2.718c.81-1.08 2.27-1.19 3.205-.275zM6.831 4.64c1.265 0 2.292 1.125 2.292 2.51 0 1.386-1.027 2.511-2.292 2.511S4.54 8.537 4.54 7.152c0-1.386 1.026-2.51 2.291-2.51zm0 1.504c-.507 0-.918.451-.918 1.007 0 .555.411 1.006.918 1.006.507 0 .919-.451.919-1.006 0-.556-.412-1.007-.919-1.007z" />
                                </svg>
                            </span>
                            Photo
                        </button>
                    </div>
                    {/* Visibility Dropdown */}
                    <div className="visibility-dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
                        <button 
                            type="button"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            style={{
                                fontSize: '11px',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                border: '1px solid #ddd',
                                background: 'white',
                                cursor: 'pointer',
                                outline: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                textTransform: 'capitalize',
                                color: '#333'
                            }}
                        >
                            {visibility}
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m6 9 6 6 6-6"/>
                            </svg>
                        </button>
                        
                        {dropdownOpen && (
                            <div style={{
                                position: 'absolute',
                                bottom: 'calc(100% + 8px)',
                                left: 0,
                                background: 'white',
                                border: '1px solid #eee',
                                borderRadius: '6px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                                zIndex: 100,
                                minWidth: '100px',
                                overflow: 'hidden'
                            }}>
                                <div 
                                    onClick={() => { setVisibility('public'); setDropdownOpen(false); }}
                                    style={{ padding: '8px 16px', fontSize: '12px', cursor: 'pointer', borderBottom: '1px solid #f5f5f5', background: visibility === 'public' ? '#f0f7ff' : 'transparent' }}
                                    onMouseOver={(e) => (e.currentTarget.style.background = '#f0f7ff')}
                                    onMouseOut={(e) => (e.currentTarget.style.background = visibility === 'public' ? '#f0f7ff' : 'transparent')}
                                >
                                    Public
                                </div>
                                <div 
                                    onClick={() => { setVisibility('private'); setDropdownOpen(false); }}
                                    style={{ padding: '8px 16px', fontSize: '12px', cursor: 'pointer', background: visibility === 'private' ? '#f0f7ff' : 'transparent' }}
                                    onMouseOver={(e) => (e.currentTarget.style.background = '#f0f7ff')}
                                    onMouseOut={(e) => (e.currentTarget.style.background = visibility === 'private' ? '#f0f7ff' : 'transparent')}
                                >
                                    Private
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="_feed_inner_text_area_btn">
                    <button 
                        type="button" 
                        className="_feed_inner_text_area_btn_link"
                        onClick={handleSubmit}
                        disabled={postMutation.isPending || (!text.trim() && !selectedImage)}
                        style={{
                            background: '#00ACFF',
                            color: 'white',
                            border: 'none',
                            padding: '8px 20px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: 600,
                            opacity: (postMutation.isPending || (!text.trim() && !selectedImage)) ? 0.6 : 1
                        }}
                    >
                        <svg className="_mar_img" xmlns="http://www.w3.org/2000/svg" width="14" height="13" fill="none" viewBox="0 0 14 13">
                            <path fill="#fff" fillRule="evenodd" d="M6.37 7.879l2.438 3.955a.335.335 0 00.34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 00-.09-.35.341.341 0 00-.34-.088L1.75 4.03a.34.34 0 00-.247.289.343.343 0 00.16.347L5.666 7.17 9.2 3.597a.5.5 0 01.712.703L6.37 7.88zM9.097 13c-.464 0-.89-.236-1.14-.641L5.372 8.165l-4.237-2.65a1.336 1.336 0 01-.622-1.331c.074-.536.441-.96.957-1.112L11.774.054a1.347 1.347 0 011.67 1.682l-3.05 10.296A1.332 1.332 0 019.098 13z" clipRule="evenodd" />
                        </svg> 
                        <span>{postMutation.isPending ? 'Posting...' : 'Post'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}